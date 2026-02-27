import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const screenWidth = Dimensions.get('window').width;
const panelWidth = Math.min(screenWidth * 0.92, 420);

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const difficultyConfig = {
  easy: { label: 'Easy', color: colors.difficultyColors.easy[0] },
  medium: { label: 'Medium', color: colors.difficultyColors.medium[0] },
  hard: { label: 'Hard', color: colors.difficultyColors.hard[0] },
  expert: { label: 'Expert', color: colors.difficultyColors.expert[0] },
};

export default function StatsPanel() {
  const lives = useGameStore(s => s.lives);
  const maxLives = useGameStore(s => s.maxLives);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const stats = useGameStore(s => s.stats);
  const difficulty = useGameStore(s => s.difficulty);

  const cfg = difficultyConfig[difficulty];

  return (
    <View style={[styles.container, { width: panelWidth }]}>
      {/* Difficulty badge */}
      <View style={[styles.badge, { backgroundColor: cfg.color }]}>
        <Text style={styles.badgeText}>{cfg.label}</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timerDot} />
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>

      {/* Lives */}
      <View style={styles.livesContainer}>
        {Array.from({ length: maxLives }, (_, i) => (
          <View
            key={i}
            style={[
              styles.heartCircle,
              i < lives ? styles.heartAlive : styles.heartDead,
            ]}
          >
            <Text style={[styles.heartIcon, { color: i < lives ? colors.white : colors.gray400 }]}>
              {'\u2665'}
            </Text>
          </View>
        ))}
        {lives < maxLives && (
          <TouchableOpacity
            onPress={() => useGameStore.setState({ showAdPrompt: 'life' })}
            style={styles.plusLifeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.plusLifeText}>+1</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Errors counter */}
      {stats.mistakesMade > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsText}>{stats.mistakesMade}</Text>
          <Text style={styles.errorsX}>{'\u2715'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.gray100,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },
  timerText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray700,
    fontVariant: ['tabular-nums'],
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heartCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartAlive: {
    backgroundColor: colors.accent,
    elevation: 2,
    shadowColor: colors.accentLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  heartDead: {
    backgroundColor: colors.gray200,
    transform: [{ scale: 0.9 }],
  },
  heartIcon: {
    fontSize: 14,
  },
  plusLifeButton: {
    marginLeft: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  plusLifeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.white,
  },
  errorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff1f2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  errorsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  errorsX: {
    fontSize: 10,
    color: '#fb7185',
  },
});
