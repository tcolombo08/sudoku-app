import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import useGameStore from '../store/gameStore.js';
import useFirebase from '../hooks/useFirebase.js';
import { colors } from '../theme/colors.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatItem({ value, label, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HistRow({ label, value }) {
  return (
    <View style={styles.histRow}>
      <Text style={styles.histLabel}>{label}</Text>
      <Text style={styles.histValue}>{value}</Text>
    </View>
  );
}

const diffLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };

export default function PauseModal() {
  const isPaused = useGameStore(s => s.isPaused);
  const togglePause = useGameStore(s => s.togglePause);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const stats = useGameStore(s => s.stats);
  const lives = useGameStore(s => s.lives);
  const maxLives = useGameStore(s => s.maxLives);
  const difficulty = useGameStore(s => s.difficulty);
  const { getUserProfile } = useFirebase();
  const [historicalStats, setHistoricalStats] = useState(null);

  useEffect(() => {
    if (isPaused) {
      getUserProfile().then(p => {
        if (p) setHistoricalStats(p);
      });
    }
  }, [isPaused, getUserProfile]);

  if (!isPaused) return null;

  const cfg = colors.difficultyColors[difficulty];

  return (
    <Modal transparent visible={isPaused} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Pause icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.pauseIcon}>{'\u275A\u275A'}</Text>
          </View>

          <Text style={styles.title}>Game Paused</Text>
          <View style={[styles.diffBadge, { backgroundColor: cfg ? cfg[0] : colors.primary }]}>
            <Text style={styles.diffBadgeText}>{diffLabels[difficulty]}</Text>
          </View>

          {/* Current game stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionLabel}>Current Game</Text>
            <View style={styles.statsRow}>
              <StatItem value={formatTime(elapsedSeconds)} label="Time" color={colors.primary} />
              <View style={styles.statDivider} />
              <StatItem value={stats.mistakesMade} label="Mistakes" color={colors.danger} />
              <View style={styles.statDivider} />
              <StatItem value={stats.hintsUsed} label="Hints" color={colors.warning} />
              <View style={styles.statDivider} />
              <StatItem value={`${lives}/${maxLives}`} label="Lives" color={colors.accent} />
            </View>
          </View>

          {/* Historical stats */}
          {historicalStats && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionLabel}>Your Stats</Text>
              <ScrollView style={styles.histContainer}>
                {historicalStats.gamesWon != null && (
                  <HistRow label="Games Won" value={historicalStats.gamesWon} />
                )}
                {historicalStats.gamesPlayed != null && (
                  <HistRow label="Total Games" value={historicalStats.gamesPlayed} />
                )}
                {historicalStats.totalErrors != null && (
                  <HistRow label="Total Errors" value={historicalStats.totalErrors} />
                )}
                {historicalStats.totalHints != null && (
                  <HistRow label="Total Hints" value={historicalStats.totalHints} />
                )}
                {historicalStats.bestTimes && Object.entries(historicalStats.bestTimes).map(([diff, time]) => (
                  <HistRow key={diff} label={`Best ${diffLabels[diff] || diff}`} value={formatTime(time)} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Resume button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={togglePause}
            style={[styles.resumeButton, { backgroundColor: cfg ? cfg[0] : colors.primary }]}
          >
            <Text style={styles.resumeText}>Resume</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pauseIcon: {
    fontSize: 20,
    color: colors.white,
    letterSpacing: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.gray900,
    marginBottom: 8,
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 16,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  statsSection: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.gray200,
  },
  histContainer: {
    maxHeight: 120,
  },
  histRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  histLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  histValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray700,
  },
  resumeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  resumeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
