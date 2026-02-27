import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore.js';
import useFirebase from '../hooks/useFirebase.js';
import GameBoard from '../components/GameBoard.js';
import NumberPad from '../components/NumberPad.js';
import StatsPanel from '../components/StatsPanel.js';
import ModeToggle from '../components/ModeToggle.js';
import GameOverModal from '../components/GameOverModal.js';
import DifficultySelector from '../components/DifficultySelector.js';
import AdPrompt from '../components/AdPrompt.js';
import { colors } from '../theme/colors.js';

export default function GameScreen() {
  const game = useGameStore(s => s.game);
  const gameId = useGameStore(s => s.gameId);
  const moveCount = useGameStore(s => s.moveCount);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);
  const difficulty = useGameStore(s => s.difficulty);
  const errorFlash = useGameStore(s => s.errorFlash);
  const { saveGameState, saveGameResult, isInitialized } = useFirebase();

  // Auto-save to Firebase every 10 moves
  useEffect(() => {
    if (!isInitialized || !game || !gameId || moveCount === 0) return;
    if (moveCount % 10 !== 0) return;

    const state = game.getState();
    saveGameState(gameId, { ...state, difficulty });
  }, [moveCount, isInitialized, game, gameId, saveGameState, difficulty]);

  // Save result on game end
  useEffect(() => {
    if (!isInitialized || !game) return;
    if (!isGameOver && !isWon) return;

    const result = game.getResult();
    saveGameResult({ ...result, difficulty });
  }, [isGameOver, isWon, isInitialized, game, saveGameResult, difficulty]);

  if (!game) {
    return <DifficultySelector />;
  }

  const handleNewGame = () => {
    Alert.alert(
      'New Game',
      'Start a new game? Current progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Game',
          style: 'destructive',
          onPress: () => {
            useGameStore.getState().cleanup();
            useGameStore.setState({ game: null });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Error flash overlay */}
      {errorFlash && <View style={styles.errorFlash} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>9</Text>
          </View>
          <Text style={styles.titleText}>Sudoku</Text>
        </View>
        <TouchableOpacity onPress={handleNewGame} activeOpacity={0.6} style={styles.newButton}>
          <Text style={styles.newButtonText}>{'\u21BB'} New</Text>
        </TouchableOpacity>
      </View>

      <StatsPanel />
      <GameBoard />
      <ModeToggle />
      <NumberPad />

      <GameOverModal />
      <AdPrompt />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSky50,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    zIndex: 40,
    pointerEvents: 'none',
  },
  header: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.gray900,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newButtonText: {
    fontSize: 12,
    color: colors.gray400,
  },
});
