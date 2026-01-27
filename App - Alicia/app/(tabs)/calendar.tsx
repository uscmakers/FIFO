import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

type FoodItem = {
  id: string;
  name: string;
  expiryDate: string; // YYYY-MM-DD
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function toKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}
function fullDateLabel(dateKey: string) {
  const d = fromKey(dateKey);
  return d.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function buildMonthGrid(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // Sunday start

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    days.push(cur);
  }
  return days;
}

// Theme
const PINK = '#ff4da6';
const PINK_SOFT = '#ffe6f2';
const BORDER = '#f0c2d9';
const TEXT = '#000000';

const GAP = 8;
const SIDE_PADDING = 16;

export default function CalendarScreen() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));

  // Modal state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Placeholder data (swap with Firebase later)
  const foodItems: FoodItem[] = useMemo(
    () => [
      { id: '1', name: 'Milk', expiryDate: toKey(today) },
      { id: '2', name: 'Spinach', expiryDate: toKey(today) },
      {
        id: '3',
        name: 'Strawberries',
        expiryDate: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
      },
      {
        id: '4',
        name: 'Chicken',
        expiryDate: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
      },
      {
        id: '5',
        name: 'Eggs',
        expiryDate: toKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
      },
    ],
    [today]
  );

  const foodByDate = useMemo(() => {
    const map: Record<string, FoodItem[]> = {};
    for (const item of foodItems) {
      if (!map[item.expiryDate]) map[item.expiryDate] = [];
      map[item.expiryDate].push(item);
    }
    return map;
  }, [foodItems]);

  const days = useMemo(() => buildMonthGrid(month), [month]);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 7 columns guaranteed
  const screenWidth = Dimensions.get('window').width;
  const availableWidth = screenWidth - SIDE_PADDING * 2;
  const cellWidth = Math.floor((availableWidth - GAP * 6) / 7);

  const selectedItems = selectedDateKey ? (foodByDate[selectedDateKey] ?? []) : [];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: SIDE_PADDING,
        backgroundColor: 'white',
        flexGrow: 1,
        gap: 12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          onPress={() => setMonth((m) => addMonths(m, -1))}
          style={{
            padding: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: PINK_SOFT,
          }}
        >
          <Text style={{ fontSize: 18, color: TEXT }}>‹</Text>
        </Pressable>

        <Text style={{ fontSize: 20, fontWeight: '800', color: TEXT }}>{monthLabel(month)}</Text>

        <Pressable
          onPress={() => setMonth((m) => addMonths(m, 1))}
          style={{
            padding: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: PINK_SOFT,
          }}
        >
          <Text style={{ fontSize: 18, color: TEXT }}>›</Text>
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={{ flexDirection: 'row', gap: GAP }}>
      {dayNames.map((d, i) => (
        <View key={`${d}-${i}`} style={{ width: cellWidth, alignItems: 'center' }}>

            <Text style={{ fontWeight: '700', color: TEXT }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: GAP }}>
        {days.map((d) => {
          const key = toKey(d);
          const isToday = sameDay(d, today);
          const isInMonth = d.getMonth() === month.getMonth();
          const items = foodByDate[key] ?? [];

          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDateKey(key)}
              style={{
                width: cellWidth,
                minHeight: 82,
                padding: 6,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: isToday ? PINK : BORDER,
                backgroundColor: isToday ? PINK_SOFT : 'white',
                opacity: isInMonth ? 1 : 0.35,
              }}
            >
              <Text style={{ fontWeight: '800', color: TEXT, fontSize: 13 }}>{d.getDate()}</Text>

              <View style={{ marginTop: 6, gap: 4 }}>
                {items.slice(0, 2).map((it) => (
                  <View
                    key={it.id}
                    style={{
                      backgroundColor: PINK_SOFT,
                      borderWidth: 1,
                      borderColor: BORDER,
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: '700', color: TEXT }}>
                      {it.name}
                    </Text>
                  </View>
                ))}

                {items.length > 2 && (
                  <Text style={{ fontSize: 10, fontWeight: '700', color: TEXT }}>
                    +{items.length - 2} more
                  </Text>
                )}

              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Modal for day details */}
      <Modal
        visible={selectedDateKey !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDateKey(null)}
      >
        {/* Backdrop */}
        <Pressable
          onPress={() => setSelectedDateKey(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
        >
          {/* Card */}
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 16,
              borderWidth: 2,
              borderColor: BORDER,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: TEXT }}>
                  {selectedDateKey ? fullDateLabel(selectedDateKey) : ''}
                </Text>
                <Text style={{ marginTop: 4, color: TEXT }}>
                  Items expiring this day
                </Text>
              </View>

              <Pressable
                onPress={() => setSelectedDateKey(null)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: PINK_SOFT,
                  borderWidth: 1,
                  borderColor: BORDER,
                }}
              >
                <Text style={{ color: TEXT, fontWeight: '800' }}>Close</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 14, gap: 10 }}>
              {selectedItems.length === 0 ? (
                <View style={{ padding: 14, borderRadius: 14, backgroundColor: PINK_SOFT, borderWidth: 1, borderColor: BORDER }}>
                  <Text style={{ color: TEXT, fontWeight: '700' }}>No items expiring 🎀</Text>
                </View>
              ) : (
                selectedItems.map((it) => (
                  <View
                    key={it.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: BORDER,
                      backgroundColor: 'white',
                    }}
                  >
                    <Text style={{ color: TEXT, fontWeight: '900', fontSize: 16 }}>{it.name}</Text>
                    <Text style={{ color: '#444', marginTop: 4 }}>Expiry: {it.expiryDate}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={{ height: 10 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
