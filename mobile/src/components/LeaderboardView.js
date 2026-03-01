import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useFirebase from '../hooks/useFirebase.js';
import { colors } from '../theme/colors.js';
import { AVATARS, getAvatarUrl, DEFAULT_AVATAR_ID } from '@shared/avatars.js';

const AVATAR_COLORS = [
  '#38bdf8', '#34d399', '#a78bfa', '#f472b6',
  '#fbbf24', '#60a5fa', '#a3e635', '#e879f9',
  '#fb923c', '#f87171', '#14b8a6', '#6366f1',
];

function SmallAvatar({ avatarId, nickname, storageBucket }) {
  const [error, setError] = useState(false);
  const id = avatarId || DEFAULT_AVATAR_ID;
  const colorIndex = AVATARS.findIndex(a => a.id === id);
  const bgColor = AVATAR_COLORS[colorIndex >= 0 ? colorIndex : 0];
  const initial = (nickname || 'A').charAt(0).toUpperCase();

  if (error || !storageBucket) {
    return (
      <View style={[styles.entryAvatar, { backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{initial}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getAvatarUrl(id, storageBucket) }}
      style={styles.entryAvatar}
      onError={() => setError(true)}
    />
  );
}

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const difficulties = ['easy', 'medium', 'hard', 'expert'];
const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardView() {
  const { getLeaderboard, isInitialized, getStorageBucket } = useFirebase();
  const storageBucket = getStorageBucket();
  const [difficulty, setDifficulty] = useState('medium');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    setLoading(true);
    getLeaderboard(difficulty).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [difficulty, isInitialized, getLeaderboard]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top players by best time</Text>
      </View>

      {/* Difficulty tabs */}
      <View style={styles.tabBar}>
        {difficulties.map(d => (
          <TouchableOpacity
            key={d}
            onPress={() => setDifficulty(d)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              d === difficulty ? styles.tabActive : styles.tabInactive,
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: d === difficulty ? colors.gray900 : colors.gray500 },
            ]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isInitialized ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔌</Text>
          <Text style={styles.emptyText}>Firebase not configured</Text>
          <Text style={styles.emptySubtext}>Leaderboard unavailable</Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : data?.top10?.length > 0 ? (
        <View style={styles.list}>
          {data.top10.map((entry, i) => {
            const isTop1 = i === 0;
            const isTop3 = i < 3;

            return (
              <View
                key={i}
                style={[
                  styles.entry,
                  isTop1 && styles.entryTop1,
                  isTop3 && !isTop1 && styles.entryTop3,
                  !isTop3 && styles.entryDefault,
                ]}
              >
                <View style={styles.rankContainer}>
                  {isTop3 ? (
                    <Text style={styles.medal}>{medals[i]}</Text>
                  ) : (
                    <Text style={styles.rank}>{i + 1}</Text>
                  )}
                </View>
                <SmallAvatar
                  avatarId={entry.avatarId}
                  nickname={entry.nickname}
                  storageBucket={storageBucket}
                />
                <Text style={[styles.nickname, isTop1 && styles.nicknameTop1]} numberOfLines={1}>
                  {entry.nickname || 'Anonymous'}
                </Text>
                <Text style={[styles.time, isTop1 && styles.timeTop1]}>
                  {formatTime(entry.time)}
                </Text>
              </View>
            );
          })}

          {data.userRank && data.userRank > 10 && (
            <View style={styles.userRankSection}>
              <View style={styles.userRankEntry}>
                <View style={styles.rankContainer}>
                  <Text style={[styles.rank, { color: colors.primary }]}>{data.userRank}</Text>
                </View>
                <Text style={styles.nickname}>You</Text>
                <Text style={styles.time}>{formatTime(data.userEntry?.time)}</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyText}>No entries yet</Text>
          <Text style={styles.emptySubtext}>Be the first to complete a game!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray900,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray400,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabInactive: {},
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.gray400,
  },
  list: {
    gap: 8,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  entryTop1: {
    backgroundColor: '#fffbeb',
    borderColor: '#fbbf24',
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  entryTop3: {
    backgroundColor: colors.gray50,
    borderColor: colors.gray200,
  },
  entryDefault: {
    backgroundColor: colors.white,
    borderColor: colors.gray100,
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
  },
  medal: {
    fontSize: 18,
  },
  rank: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.gray400,
    textAlign: 'center',
  },
  entryAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  nickname: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray900,
  },
  nicknameTop1: {
    fontWeight: '700',
  },
  time: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: colors.gray600,
  },
  timeTop1: {
    fontWeight: '700',
    color: colors.gray900,
  },
  userRankSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.gray200,
  },
  userRankEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray500,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.gray400,
    marginTop: 4,
  },
});
