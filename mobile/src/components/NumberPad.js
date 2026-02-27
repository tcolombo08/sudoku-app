import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const screenWidth = Dimensions.get('window').width;
const padWidth = Math.min(screenWidth * 0.92, 420);

function NumberButton({ num, onPress, disabled, isComplete, count }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradient = colors.numColors[num];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
    onPress(num);
  };

  const bgColor = isComplete ? colors.gray100 : disabled ? colors.gray100 : gradient[0];
  const textColor = isComplete ? colors.gray300 : disabled ? colors.gray400 : colors.white;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        disabled={disabled || isComplete}
        style={[
          styles.numButton,
          {
            backgroundColor: bgColor,
            opacity: disabled && !isComplete ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.numText, { color: textColor }]}>{num}</Text>
        {!isComplete && count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NumberPad() {
  const placeNumber = useGameStore(s => s.placeNumber);
  const selectedCell = useGameStore(s => s.selectedCell);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);
  const board = useGameStore(s => s.board);

  const disabled = !selectedCell || isGameOver || isWon;

  const numberCounts = {};
  for (let n = 1; n <= 9; n++) numberCounts[n] = 0;
  if (board.length > 0) {
    for (const row of board) {
      for (const cell of row) {
        if (cell > 0) numberCounts[cell]++;
      }
    }
  }

  const eraseScaleAnim = useRef(new Animated.Value(1)).current;

  const handleErase = () => {
    Animated.sequence([
      Animated.timing(eraseScaleAnim, { toValue: 0.88, duration: 60, useNativeDriver: true }),
      Animated.timing(eraseScaleAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
    placeNumber(0);
  };

  return (
    <View style={[styles.container, { width: padWidth }]}>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <NumberButton
            key={num}
            num={num}
            onPress={placeNumber}
            disabled={disabled}
            isComplete={numberCounts[num] >= 9}
            count={numberCounts[num]}
          />
        ))}
        <Animated.View style={{ transform: [{ scale: eraseScaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleErase}
            disabled={disabled}
            style={[
              styles.eraseButton,
              { opacity: disabled ? 0.4 : 1 },
            ]}
          >
            <Text style={styles.eraseIcon}>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const buttonWidth = (padWidth - 8 * 4) / 5; // 5 columns, 8px gap * 4

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numButton: {
    width: buttonWidth,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numText: {
    fontSize: 22,
    fontWeight: '900',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray700,
  },
  eraseButton: {
    width: buttonWidth,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  eraseIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray600,
  },
});
