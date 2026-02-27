import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ProfileView from '../components/ProfileView.js';
import { colors } from '../theme/colors.js';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProfileView />
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
