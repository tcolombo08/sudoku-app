import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LeaderboardView from '../components/LeaderboardView.js';
import { colors } from '../theme/colors.js';

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LeaderboardView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
    paddingTop: 16,
  },
});
