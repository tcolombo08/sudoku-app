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

const difficultyBadgeColors = {
  easy: { bg: '#d1fae5', text: '#065f46' },
  medium: { bg: '#dbeafe', text: '#1e40af' },
  hard: { bg: '#ffedd5', text: '#9a3412' },
  expert: { bg: '#f3e8ff', text: '#6b21a8' },
};

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
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>?</Text>
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>
        <Text style={styles.emptyText}>Firebase not configured. Profile unavailable.</Text>
      </View>
    );
  }

  const stats = profile?.stats || {};
  const displayNickname = profile?.profile?.nickname || 'Anonymous';
  const initial = displayNickname.charAt(0).toUpperCase();
  const totalGames = stats.totalGames || 0;
  const gamesWon = stats.gamesWon || 0;
  const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

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
            <Text style={styles.nicknameValue}>{displayNickname}</Text>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderTopColor: colors.primary }]}>
          <Text style={styles.statEmoji}>🎮</Text>
          <Text style={styles.statNumber}>{totalGames}</Text>
          <Text style={styles.statCardLabel}>Games</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: colors.success }]}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>{gamesWon}</Text>
          <Text style={styles.statCardLabel}>Wins</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: colors.lavender }]}>
          <Text style={styles.statEmoji}>📊</Text>
          <Text style={styles.statNumber}>{winRate}%</Text>
          <Text style={styles.statCardLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Best times */}
      {stats.bestTimes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⏱️ Best Times</Text>
          {['easy', 'medium', 'hard', 'expert'].map(d => {
            const badgeColor = difficultyBadgeColors[d];
            return (
              <View key={d} style={styles.bestTimeRow}>
                <View style={[styles.difficultyBadge, { backgroundColor: badgeColor.bg }]}>
                  <Text style={[styles.difficultyBadgeText, { color: badgeColor.text }]}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                </View>
                <Text style={styles.bestTimeValue}>{formatTime(stats.bestTimes[d])}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent games */}
      {games.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Recent Games</Text>
          {games.map((g, i) => (
            <View key={i} style={[styles.gameRow, i < games.length - 1 && styles.gameRowBorder]}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameIcon}>{g.won ? '✅' : '❌'}</Text>
                <View>
                  <Text style={styles.gameDifficulty}>
                    {g.difficulty?.charAt(0).toUpperCase() + g.difficulty?.slice(1)}
                  </Text>
                </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  editText: {
    fontSize: 13,
    color: colors.primary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 16,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderTopWidth: 3,
    padding: 12,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray900,
  },
  statCardLabel: {
    fontSize: 11,
    color: colors.gray500,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
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
    paddingVertical: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    paddingVertical: 8,
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
  gameIcon: {
    fontSize: 16,
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
