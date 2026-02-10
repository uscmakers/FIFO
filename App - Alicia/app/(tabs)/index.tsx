// app/(tabs)/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { auth, db } from '../../src/firebase';

console.log('Firebase ready:', {
  projectId: db.app.options.projectId,
  authReady: !!auth,
});

type FoodItem = {
  id: string;
  name: string;
  addedDate: string;   // YYYY-MM-DD (date item entered fridge)
  expiryDate: string;  // YYYY-MM-DD (LAST safe day)
  removedDate: string | null; // YYYY-MM-DD (date consumed/removed), or null if still present
};

type StreakState = {
  currentStreak: number;
  bestStreak: number;
  points: number; // +1 per "good active day"
  lastEvaluatedDate: string | null; // YYYY-MM-DD
};

const FOOD_KEY = 'foodItems';
const STREAK_KEY = 'streakState_v2';

function todayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateKey(dateKey: string) {
  // local date at midnight
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDaysKey(dateKey: string, deltaDays: number) {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return todayKey(d);
}

function isKeyLE(a: string, b: string) {
  // works because YYYY-MM-DD lexicographically sortable
  return a <= b;
}

function isKeyLT(a: string, b: string) {
  return a < b;
}

function itemIsActiveOnDay(item: FoodItem, day: string) {
  // active if added on/before day AND not removed before or on day
  // If removedDate === day, we treat it as NOT active that day (removed that day).
  // If you prefer "still counts that day", change removedDate > day to removedDate >= day.
  const addedOk = isKeyLE(item.addedDate, day);
  const notRemoved =
    item.removedDate === null ? true : isKeyLT(day, item.removedDate); // day < removedDate
  return addedOk && notRemoved;
}

function itemGoesBadOnDay(item: FoodItem, day: string) {
  // An item "goes bad" on day if day is AFTER expiryDate, and item is still active that day.
  // Example: expiryDate = 2026-01-26 (safe through Jan 26), goes bad on Jan 27.
  return itemIsActiveOnDay(item, day) && isKeyLT(item.expiryDate, day); // expiryDate < day
}

function evaluateUpToToday(
  foodItems: FoodItem[],
  state: StreakState,
  today: string
): { next: StreakState; lastDayStatus: 'active-good' | 'active-bad' | 'paused' } {
  let next = { ...state };

  const startDay =
    next.lastEvaluatedDate === null ? today : addDaysKey(next.lastEvaluatedDate, 1);

  // If already evaluated through today, nothing to do
  if (next.lastEvaluatedDate !== null && isKeyLE(today, next.lastEvaluatedDate)) {
    // Determine status for today from current data
    const activeToday = foodItems.some((it) => itemIsActiveOnDay(it, today));
    if (!activeToday) return { next, lastDayStatus: 'paused' };
    const badToday = foodItems.some((it) => itemGoesBadOnDay(it, today));
    return { next, lastDayStatus: badToday ? 'active-bad' : 'active-good' };
  }

  let day = startDay;
  let lastStatus: 'active-good' | 'active-bad' | 'paused' = 'paused';

  while (isKeyLE(day, today)) {
    const active = foodItems.some((it) => itemIsActiveOnDay(it, day));

    if (!active) {
      // PAUSED DAY: do nothing (streak neither increases nor breaks)
      lastStatus = 'paused';
    } else {
      const bad = foodItems.some((it) => itemGoesBadOnDay(it, day));

      if (bad) {
        // STREAK BREAKS
        next.currentStreak = 0;
        lastStatus = 'active-bad';
      } else {
        // GOOD ACTIVE DAY: +1 streak, +1 point
        next.currentStreak += 1;
        next.points += 1;
        if (next.currentStreak > next.bestStreak) next.bestStreak = next.currentStreak;
        lastStatus = 'active-good';
      }
    }

    next.lastEvaluatedDate = day;
    day = addDaysKey(day, 1);
  }

  return { next, lastDayStatus: lastStatus };
}

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export default function HomeScreen() {
  const today = useMemo(() => todayKey(), []);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 0,
    bestStreak: 0,
    points: 0,
    lastEvaluatedDate: null,
  });
  const [status, setStatus] = useState<'active-good' | 'active-bad' | 'paused'>('paused');

  async function refreshAndEvaluate() {
    const items = await loadJSON<FoodItem[]>(FOOD_KEY, []);
    const savedStreak = await loadJSON<StreakState>(STREAK_KEY, {
      currentStreak: 0,
      bestStreak: 0,
      points: 0,
      lastEvaluatedDate: null,
    });

    const { next, lastDayStatus } = evaluateUpToToday(items, savedStreak, today);

    setFoodItems(items);
    setStreak(next);
    setStatus(lastDayStatus);

    await saveJSON(STREAK_KEY, next);
  }

  useEffect(() => {
    refreshAndEvaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expiredToday = foodItems.filter((it) => itemGoesBadOnDay(it, today)).filter((it) => it.removedDate === null);
  const activeToday = foodItems.filter((it) => itemIsActiveOnDay(it, today));
  const paused = activeToday.length === 0;

  const statusText =
    status === 'paused'
      ? 'Paused (fridge empty)'
      : status === 'active-bad'
      ? 'Streak broke (something went bad)'
      : 'Active (nothing went bad today)';

  async function resetForTesting() {
    const blank: StreakState = { currentStreak: 0, bestStreak: 0, points: 0, lastEvaluatedDate: null };
    setStreak(blank);
    setStatus('paused');
    await saveJSON(STREAK_KEY, blank);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14, backgroundColor: 'white', flexGrow: 1 }}>  
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Home</Text>
      <Text style={{ fontSize: 16 }}>Today: {today}</Text>

      <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 }}>
        <Text style={{ fontSize: 22 }}>🔥 Streak: {streak.currentStreak}</Text>
        <Text style={{ fontSize: 16 }}>🏆 Best: {streak.bestStreak}</Text>
        <Text style={{ fontSize: 16 }}>⭐ Points: {streak.points}</Text>
        <Text style={{ fontSize: 14 }}>
          Status: {paused ? 'Paused (no items in fridge today)' : statusText}
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>
          Last evaluated: {streak.lastEvaluatedDate ?? 'never'}
        </Text>
      </View>

      {!paused && expiredToday.length > 0 && (
        <View style={{ padding: 14, borderRadius: 12, borderWidth: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>⚠️ Went bad today:</Text>
          {expiredToday.map((it) => (
            <Text key={it.id} style={{ marginTop: 6 }}>
              • {it.name} (expiry was {it.expiryDate})
            </Text>
          ))}
        </View>
      )}

      <View style={{ padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Fridge today:</Text>
        <Text>Active items: {activeToday.length}</Text>
        <Text>Total items (all time): {foodItems.length}</Text>
      </View>

      <Pressable
        onPress={refreshAndEvaluate}
        style={{ padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16 }}>Recalculate now</Text>
      </Pressable>

      <Pressable onPress={resetForTesting} style={{ padding: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 14 }}>Reset streak (testing)</Text>
      </Pressable>
    </ScrollView>
  );
}
