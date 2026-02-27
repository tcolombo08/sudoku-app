import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

const BOARD_PADDING = 2;
const screenWidth = Dimensions.get('window').width;
const boardSize = Math.min(screenWidth * 0.92, 420);
const cellSize = (boardSize - BOARD_PADDING * 2) / 9;

function Cell({ row, col }) {
  const board = useGameStore(s => s.board);
  const puzzle = useGameStore(s => s.puzzle);
  const notes = useGameStore(s => s.notes);
  const selectedCell = useGameStore(s => s.selectedCell);
  const selectCell = useGameStore(s => s.selectCell);
  const hasConflict = useGameStore(s => s.hasConflict);
  const lastPlacedCell = useGameStore(s => s.lastPlacedCell);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const value = board[row]?.[col] || 0;
  const isGiven = puzzle[row]?.[col] !== 0;
  const cellNotes = notes[row]?.[col] || [];
  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isSameRow = selectedCell?.row === row;
  const isSameCol = selectedCell?.col === col;
  const isSameBox =
    selectedCell &&
    Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
    Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
  const isHighlighted = (isSameRow || isSameCol || isSameBox) && !isSelected;
  const conflict = value !== 0 && hasConflict(row, col);

  const selectedValue = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : 0;
  const isSameNumber = value !== 0 && selectedValue !== 0 && value === selectedValue && !isSelected;

  const justPlaced = lastPlacedCell?.row === row && lastPlacedCell?.col === col;

  // Pop animation
  useEffect(() => {
    if (justPlaced) {
      scaleAnim.setValue(0.5);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [justPlaced, lastPlacedCell?.ts]);

  let bgColor = colors.white;
  if (isSelected) bgColor = colors.cellSelected;
  else if (conflict) bgColor = colors.cellConflict;
  else if (isSameNumber) bgColor = colors.cellSame;
  else if (isHighlighted) bgColor = colors.cellHighlight;

  let textColor = colors.cellUser;
  let fontWeight = '600';
  if (isGiven) { textColor = colors.cellGiven; fontWeight = '700'; }
  if (conflict && !isGiven) { textColor = colors.cellError; fontWeight = '700'; }

  // Border widths for 3x3 subgrid
  const borderLeft = col % 3 === 0 ? 2 : StyleSheet.hairlineWidth;
  const borderRight = col === 8 ? 2 : 0;
  const borderTop = row % 3 === 0 ? 2 : StyleSheet.hairlineWidth;
  const borderBottom = row === 8 ? 2 : 0;

  const borderLeftColor = col % 3 === 0 ? colors.borderThick : colors.borderThin;
  const borderTopColor = row % 3 === 0 ? colors.borderThick : colors.borderThin;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectCell(row, col)}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: bgColor,
          borderLeftWidth: borderLeft,
          borderLeftColor,
          borderRightWidth: borderRight,
          borderRightColor: colors.borderThick,
          borderTopWidth: borderTop,
          borderTopColor,
          borderBottomWidth: borderBottom,
          borderBottomColor: colors.borderThick,
        },
      ]}
    >
      {value !== 0 ? (
        <Animated.Text
          style={[
            styles.cellText,
            {
              color: textColor,
              fontWeight,
              transform: [{ scale: justPlaced ? scaleAnim : 1 }],
            },
          ]}
        >
          {value}
        </Animated.Text>
      ) : cellNotes.length > 0 ? (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <Text key={n} style={styles.noteText}>
              {cellNotes.includes(n) ? n : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const MemoCell = React.memo(Cell);

export default function GameBoard() {
  const board = useGameStore(s => s.board);
  const shakeBoard = useGameStore(s => s.shakeBoard);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shakeBoard) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -2, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [shakeBoard]);

  if (!board || board.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.board,
        { width: boardSize, transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 9 }, (_, col) => (
            <MemoCell key={`${row}-${col}`} row={row} col={col} />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.boardBg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderThick,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: cellSize * 0.48,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    textAlign: 'center',
    fontSize: cellSize * 0.2,
    color: colors.annotation,
    fontWeight: '500',
    lineHeight: cellSize * 0.33,
  },
});
