import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useFirebase from '../hooks/useFirebase.js';
import { colors } from '../theme/colors.js';

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ProfileView() {
  const { profile, isInitialized, updateNickname, getUserGames } = useFirebase();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.profile?.nickname) {
      setNickname(profile.profile.nickname);
    }
  }, [profile]);

  useEffect(() => {
    if (isInitialized) {
      getUserGames(10).then(setGames);
    }
  }, [isInitialized, getUserGames]);

  const handleSaveNickname = async () => {
    setSaving(true);
    await updateNickname(nickname);
    setSaving(false);
    setEditing(false);
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.emptyText}>Firebase not configured. Profile unavailable.</Text>
      </View>
    );
  }

  const stats = profile?.stats || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {/* Nickname */}
      <View style={styles.card}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              style={styles.nicknameInput}
              autoFocus
              placeholder="Nickname"
            />
            <TouchableOpacity
              onPress={handleSaveNickname}
              disabled={saving || nickname.length < 2}
              style={[styles.saveButton, { opacity: saving || nickname.length < 2 ? 0.5 : 1 }]}
            >
              <Text style={styles.saveButtonText}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nicknameRow}>
            <View>
              <Text style={styles.nicknameLabel}>Nickname</Text>
              <Text style={styles.nicknameValue}>
                {profile?.profile?.nickname || 'Anonymous'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.gamesWon || 0}</Text>
          <Text style={styles.statCardLabel}>Games Won</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalGames || 0}</Text>
          <Text style={styles.statCardLabel}>Total Games</Text>
        </View>
      </View>

      {/* Best times */}
      {stats.bestTimes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Best Times</Text>
          {['easy', 'medium', 'hard', 'expert'].map(d => (
            <View key={d} style={styles.bestTimeRow}>
              <Text style={styles.bestTimeLabel}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
              <Text style={styles.bestTimeValue}>{formatTime(stats.bestTimes[d])}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent games */}
      {games.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {games.map((g, i) => (
            <View key={i} style={[styles.gameRow, i < games.length - 1 && styles.gameRowBorder]}>
              <View style={styles.gameInfo}>
                <View style={[styles.gameDot, { backgroundColor: g.won ? colors.success : colors.danger }]} />
                <Text style={styles.gameDifficulty}>
                  {g.difficulty?.charAt(0).toUpperCase() + g.difficulty?.slice(1)}
                </Text>
              </View>
              <Text style={styles.gameTime}>{formatTime(g.time)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    color: colors.gray500,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nicknameLabel: {
    fontSize: 14,
    color: colors.gray500,
  },
  nicknameValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  editText: {
    fontSize: 14,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
  },
  bestTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bestTimeLabel: {
    fontSize: 14,
    color: colors.gray500,
  },
  bestTimeValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  gameRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameDifficulty: {
    fontSize: 14,
    color: colors.gray700,
  },
  gameTime: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.gray500,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray400,
    fontSize: 14,
    paddingVertical: 32,
  },
});
