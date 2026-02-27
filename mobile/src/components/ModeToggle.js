import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const screenWidth = Dimensions.get('window').width;
const toggleWidth = Math.min(screenWidth * 0.92, 420);

export default function ModeToggle() {
  const mode = useGameStore(s => s.mode);
  const toggleMode = useGameStore(s => s.toggleMode);
  const undo = useGameStore(s => s.undo);
  const redo = useGameStore(s => s.redo);
  const getHint = useGameStore(s => s.getHint);
  const freeHintUsed = useGameStore(s => s.freeHintUsed);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);

  const disabled = isGameOver || isWon;
  const isNotes = mode === 'annotation';

  const thumbAnim = useRef(new Animated.Value(isNotes ? 1 : 0)).current;

  const handleToggle = () => {
    toggleMode();
    Animated.timing(thumbAnim, {
      toValue: isNotes ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const thumbTranslate = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const trackColor = isNotes ? colors.lavender : colors.gray300;

  return (
    <View style={[styles.container, { width: toggleWidth }]}>
      {/* Notes switch */}
      <View style={styles.notesSection}>
        <Text style={[styles.notesLabel, { color: isNotes ? colors.lavenderDark : colors.gray400 }]}>
          Notes
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggle}
          disabled={disabled}
          style={[styles.switchTrack, { backgroundColor: trackColor, opacity: disabled ? 0.4 : 1 }]}
        >
          <Animated.View style={[styles.switchThumb, { transform: [{ translateX: thumbTranslate }] }]} />
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={undo}
          disabled={disabled}
          style={[styles.actionButton, { opacity: disabled ? 0.25 : 1 }]}
        >
          <Text style={styles.actionIcon}>{'\u21A9'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={redo}
          disabled={disabled}
          style={[styles.actionButton, { opacity: disabled ? 0.25 : 1 }]}
        >
          <Text style={styles.actionIcon}>{'\u21AA'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={getHint}
          disabled={disabled}
          style={[
            styles.hintButton,
            freeHintUsed ? styles.hintButtonUsed : styles.hintButtonFree,
            { opacity: disabled ? 0.25 : 1 },
          ]}
        >
          <Text style={styles.hintIcon}>{freeHintUsed ? '\u25B6' : '\u{1F4A1}'}</Text>
          <Text style={[styles.hintText, { color: freeHintUsed ? colors.gray500 : colors.white }]}>
            {freeHintUsed ? 'Ad Hint' : 'Hint'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 16,
    gap: 12,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    color: colors.gray500,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray200,
    marginHorizontal: 4,
  },
  hintButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  hintButtonFree: {
    backgroundColor: colors.warning,
  },
  hintButtonUsed: {
    backgroundColor: colors.gray100,
    elevation: 0,
    shadowOpacity: 0,
  },
  hintIcon: {
    fontSize: 14,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
