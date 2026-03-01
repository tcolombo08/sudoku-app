import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from './src/screens/GameScreen.js';
import LeaderboardScreen from './src/screens/LeaderboardScreen.js';
import ProfileScreen from './src/screens/ProfileScreen.js';
import { colors } from './src/theme/colors.js';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Play: '\u25B6',
    Rankings: '\u{1F3C6}',
    Profile: '\u{1F464}',
  };

  return (
    <View style={styles.tabItem}>
      <Text style={[
        styles.tabIcon,
        { color: focused ? colors.primary : colors.gray400, fontSize: focused ? 18 : 16 },
      ]}>
        {icons[label]}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color: focused ? colors.primary : colors.gray400, fontWeight: focused ? '600' : '400' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
            tabBarIconStyle: { width: '100%' },
          }}
        >
          <Tab.Screen
            name="Play"
            component={GameScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="Play" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Rankings"
            component={LeaderboardScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="Rankings" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 10,
  },
});
