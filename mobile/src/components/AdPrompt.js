import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import useGameStore from '../store/gameStore.js';
import { colors } from '../theme/colors.js';

export default function AdPrompt() {
  const showAdPrompt = useGameStore(s => s.showAdPrompt);
  const onAdWatched = useGameStore(s => s.onAdWatched);
  const dismissAdPrompt = useGameStore(s => s.dismissAdPrompt);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!showAdPrompt) return null;

  const label = showAdPrompt === 'hint' ? 'Hint' : 'Extra Life';

  const handleWatch = () => {
    setWatching(true);
    setProgress(0);

    const duration = 5000;
    const step = 50;
    let elapsed = 0;

    intervalRef.current = setInterval(() => {
      elapsed += step;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setWatching(false);
        setProgress(0);
        onAdWatched(showAdPrompt);
      }
    }, step);
  };

  return (
    <Modal transparent visible={!!showAdPrompt} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={watching ? undefined : dismissAdPrompt}
        />

        <View style={styles.card}>
          {watching ? (
            <>
              <View style={styles.adIconBox}>
                <Text style={styles.adPlayIcon}>{'\u25B6'}</Text>
              </View>
              <Text style={styles.watchingText}>Watching ad...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.remainingText}>
                {Math.ceil((100 - progress) / 20)}s remaining
              </Text>
            </>
          ) : (
            <>
              <View style={styles.promptIcon}>
                <Text style={styles.promptEmoji}>
                  {showAdPrompt === 'hint' ? '\u{1F4A1}' : '\u2665'}
                </Text>
              </View>

              <Text style={styles.promptTitle}>Need a {label}?</Text>
              <Text style={styles.promptSub}>Watch a short ad to unlock</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleWatch}
                style={styles.watchButton}
              >
                <Text style={styles.watchButtonText}>Watch Ad (5s)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={dismissAdPrompt}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissText}>No thanks</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  adIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.gray800,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  adPlayIcon: {
    fontSize: 28,
    color: colors.white,
  },
  watchingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 10,
    color: colors.gray400,
    marginTop: 8,
  },
  promptIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  promptEmoji: {
    fontSize: 28,
    color: colors.white,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  promptSub: {
    fontSize: 12,
    color: colors.gray400,
    marginBottom: 20,
  },
  watchButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.warning,
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  watchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  dismissButton: {
    marginTop: 12,
    padding: 8,
  },
  dismissText: {
    fontSize: 12,
    color: colors.gray400,
  },
});
