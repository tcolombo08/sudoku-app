import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const difficulties = [
  { key: 'easy', label: 'Easy', desc: '40-50 clues', emoji: '\u{1F33F}' },
  { key: 'medium', label: 'Medium', desc: '30-40 clues', emoji: '\u{1F525}' },
  { key: 'hard', label: 'Hard', desc: '20-30 clues', emoji: '\u26A1' },
  { key: 'expert', label: 'Expert', desc: '10-20 clues', emoji: '\u{1F480}' },
];

function DifficultyButton({ item, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgColor = colors.difficultyColors[item.key][0];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => onPress(item.key));
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[styles.diffButton, { backgroundColor: bgColor }]}
      >
        <Text style={styles.diffEmoji}>{item.emoji}</Text>
        <Text style={styles.diffLabel}>{item.label}</Text>
        <Text style={styles.diffDesc}>{item.desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DifficultySelector() {
  const newGame = useGameStore(s => s.newGame);
  const game = useGameStore(s => s.game);

  if (game) return null;

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>9</Text>
        </View>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.subtitle}>Train your brain</Text>
      </View>

      {/* Difficulty grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {difficulties.slice(0, 2).map(d => (
            <DifficultyButton key={d.key} item={d} onPress={newGame} />
          ))}
        </View>
        <View style={styles.gridRow}>
          {difficulties.slice(2, 4).map(d => (
            <DifficultyButton key={d.key} item={d} onPress={newGame} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.bgSky50,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ rotate: '3deg' }],
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white,
    transform: [{ rotate: '-3deg' }],
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.gray900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 4,
  },
  grid: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  diffButton: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  diffEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  diffLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  diffDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
