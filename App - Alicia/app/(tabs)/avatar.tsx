import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const AVATAR_KEY = 'selectedAvatarId_v1';

type Avatar = {
  id: string;
  label: string;
  emoji: string; // placeholder for now; later you can swap to images
};

async function loadString(key: string, fallback: string | null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

async function saveString(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export default function AvatarScreen() {
  const avatars: Avatar[] = useMemo(
    () => [
      { id: 'a1', label: 'Chef', emoji: '🧑‍🍳' },
      { id: 'a2', label: 'Ninja', emoji: '🥷' },
      { id: 'a3', label: 'Robot', emoji: '🤖' },
      { id: 'a4', label: 'Cat', emoji: '🐱' },
      { id: 'a5', label: 'Fox', emoji: '🦊' },
      { id: 'a6', label: 'Alien', emoji: '👽' },
      { id: 'a7', label: 'Wizard', emoji: '🧙‍♀️' },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await loadString(AVATAR_KEY, null);
      setSelectedId(saved);
    })();
  }, []);

  const selectedAvatar = avatars.find((a) => a.id === selectedId) ?? null;

  async function selectAvatar(id: string) {
    setSelectedId(id);
    await saveString(AVATAR_KEY, id);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14, backgroundColor: 'white', flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: 'black' }}>Choose an Avatar</Text>

      <View style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 8 }}>
        <Text style={{ fontSize: 16, color: 'black' }}>Selected:</Text>
        {selectedAvatar ? (
          <Text style={{ fontSize: 40 }}>{selectedAvatar.emoji}</Text>
        ) : (
          <Text style={{ fontSize: 16, color: 'black' }}>None yet</Text>
        )}
      </View>

      <Text style={{ fontSize: 16, fontWeight: '600', color: 'black' }}>Avatars</Text>

      {/* Simple 2-column grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {avatars.map((a) => {
          const isSelected = a.id === selectedId;

          return (
            <Pressable
              key={a.id}
              onPress={() => selectAvatar(a.id)}
              style={{
                width: '47%',
                padding: 14,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: isSelected ? 'black' : '#ddd',
                backgroundColor: isSelected ? '#f2f2f2' : 'white',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 44 }}>{a.emoji}</Text>
              <Text style={{ fontSize: 16, color: 'black' }}>{a.label}</Text>
              <Text style={{ fontSize: 12, color: '#555' }}>{isSelected ? 'Selected' : 'Tap to select'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
      (These are emoji placeholders — later we can swap them for your 7 custom avatar images.)
      </Text>
    </ScrollView>
  );
}
