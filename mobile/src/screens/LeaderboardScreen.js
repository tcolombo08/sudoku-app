import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LeaderboardView from '../components/LeaderboardView.js';
import { colors } from '../theme/colors.js';

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#eef2ff', colors.bgScreen]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LeaderboardView />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  safe: {
    flex: 1,
    paddingTop: 16,
  },
});
