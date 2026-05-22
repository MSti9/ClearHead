import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { View } from 'react-native';
import { SpillwayColors } from '@/lib/spillwayColors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SpillwayColors.charcoal,
          borderTopColor: SpillwayColors.border,
          borderTopWidth: 1,
          height: 88,
          paddingTop: 8,
        },
        tabBarActiveTintColor: SpillwayColors.ember,
        tabBarInactiveTintColor: SpillwayColors.mutedText,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? `${SpillwayColors.ember}26` : 'transparent',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? `${SpillwayColors.ember}26` : 'transparent',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
