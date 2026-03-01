import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileView from '../components/ProfileView.js';
import { colors } from '../theme/colors.js';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f0f9ff', colors.bgScreen]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ProfileView />
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
