import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useFirebase from '../hooks/useFirebase.js';
import { colors } from '../theme/colors.js';

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const difficulties = ['easy', 'medium', 'hard', 'expert'];

export default function LeaderboardView() {
  const { getLeaderboard, isInitialized } = useFirebase();
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
      <Text style={styles.title}>Leaderboard</Text>

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
        <Text style={styles.emptyText}>
          Firebase not configured. Leaderboard unavailable.
        </Text>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : data?.top10?.length > 0 ? (
        <View style={styles.list}>
          {data.top10.map((entry, i) => {
            const bgColors = [
              '#fffbeb', // gold
              colors.gray50,
              '#fff7ed', // orange tint
            ];
            const borderColors = ['#fde68a', colors.gray200, '#fed7aa'];

            return (
              <View
                key={i}
                style={[
                  styles.entry,
                  {
                    backgroundColor: i < 3 ? bgColors[i] : colors.white,
                    borderColor: i < 3 ? borderColors[i] : colors.gray100,
                  },
                ]}
              >
                <Text style={styles.rank}>{i + 1}</Text>
                <Text style={styles.nickname} numberOfLines={1}>
                  {entry.nickname || 'Anonymous'}
                </Text>
                <Text style={styles.time}>{formatTime(entry.time)}</Text>
              </View>
            );
          })}

          {data.userRank && data.userRank > 10 && (
            <View style={styles.userRankSection}>
              <View style={styles.userRankEntry}>
                <Text style={[styles.rank, { color: colors.primary }]}>{data.userRank}</Text>
                <Text style={styles.nickname}>You</Text>
                <Text style={styles.time}>{formatTime(data.userEntry?.time)}</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 16,
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
    paddingVertical: 32,
    alignItems: 'center',
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
  rank: {
    width: 24,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    color: colors.gray400,
  },
  nickname: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray900,
  },
  time: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: colors.gray600,
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
  emptyText: {
    textAlign: 'center',
    color: colors.gray400,
    fontSize: 14,
    paddingVertical: 32,
  },
});
