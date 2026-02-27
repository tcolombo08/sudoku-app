import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * screenWidth,
      delay: Math.random() * 1500,
      duration: 2000 + Math.random() * 2000,
      color: colors.confetti[Math.floor(Math.random() * colors.confetti.length)],
      size: 6 + Math.random() * 8,
      anim: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    pieces.forEach(p => {
      setTimeout(() => {
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          useNativeDriver: true,
        }).start();
      }, p.delay);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(p => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, screenHeight + 20],
        });
        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '720deg'],
        });
        return (
          <Animated.View
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              borderRadius: 2,
              transform: [{ translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}

function StatItem({ value, label, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function GameOverModal() {
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);
  const stats = useGameStore(s => s.stats);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const difficulty = useGameStore(s => s.difficulty);
  const newGame = useGameStore(s => s.newGame);
  const [show, setShow] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isGameOver || isWon) {
      const timer = setTimeout(() => {
        setShow(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 400);
      return () => clearTimeout(timer);
    }
    setShow(false);
    setSelectedDifficulty(null);
    slideAnim.setValue(300);
  }, [isGameOver, isWon]);

  if (!show) return null;

  const difficultyList = ['easy', 'medium', 'hard', 'expert'];
  const activeDiff = selectedDifficulty || difficulty;

  return (
    <Modal transparent visible={show} animationType="none">
      {isWon && <Confetti />}

      <View style={styles.overlay}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.sheetContent, { backgroundColor: isWon ? '#f0f9ff' : '#fff1f2' }]}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: isWon ? colors.mint : colors.accent }]}>
                <Text style={styles.iconEmoji}>{isWon ? '\u2713' : '\u2665'}</Text>
              </View>
              <Text style={styles.headerTitle}>{isWon ? 'Brilliant!' : 'No more lives!'}</Text>
              <Text style={styles.headerSub}>{isWon ? 'You crushed it!' : 'Better luck next time'}</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatItem value={formatTime(elapsedSeconds)} label="Time" color={colors.primary} />
              <View style={styles.statDivider} />
              <StatItem value={stats.mistakesMade} label="Mistakes" color={colors.danger} />
              <View style={styles.statDivider} />
              <StatItem value={stats.hintsUsed} label="Hints" color={colors.warning} />
              <View style={styles.statDivider} />
              <StatItem value={stats.movementsTotal} label="Moves" color={colors.lavender} />
            </View>

            {/* Difficulty picker */}
            <View style={styles.diffRow}>
              {difficultyList.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDifficulty(d)}
                  activeOpacity={0.7}
                  style={[
                    styles.diffPill,
                    activeDiff === d
                      ? { backgroundColor: colors.difficultyColors[d][0] }
                      : { backgroundColor: colors.gray100 },
                  ]}
                >
                  <Text style={[
                    styles.diffPillText,
                    { color: activeDiff === d ? colors.white : colors.gray500 },
                  ]}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Play again */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => newGame(activeDiff)}
              style={[styles.playAgainButton, { backgroundColor: colors.difficultyColors[activeDiff][0] }]}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    width: '100%',
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconEmoji: {
    fontSize: 28,
    color: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.gray900,
  },
  headerSub: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.gray100,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.gray100,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  diffPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  diffPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playAgainButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
