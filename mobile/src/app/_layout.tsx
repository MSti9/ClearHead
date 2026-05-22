import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/lib/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useEffect, useState } from 'react';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import {
  Merriweather_400Regular,
} from '@expo-google-fonts/merriweather';
import { useJournalStore } from '@/stores/journalStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SpillwayColors } from '@/lib/spillwayColors';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Navigation theme — Spillway Industrial Calm tokens.
// The variable name remains `journalTheme` for now to avoid a wider
// rename in this PR; logical refactor for a later cleanup.
const journalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: SpillwayColors.graphite,
    card: SpillwayColors.charcoal,
    text: SpillwayColors.bone,
    border: SpillwayColors.border,
    primary: SpillwayColors.ember,
  },
};

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const userName = useJournalStore((s) => s.userName);
  const isHydrated = useJournalStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const inWelcome = segments[0] === 'welcome';

    if (!userName && !inWelcome) {
      // First time user - show welcome screen
      router.replace('/welcome');
    } else if (userName && inWelcome) {
      // User has name but somehow on welcome - go to home
      router.replace('/(tabs)');
    }
  }, [userName, isHydrated, segments, router]);

  return (
    <ThemeProvider value={journalTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="record"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="prompts"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="new-entry"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="entries"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="calendar"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="reflection"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="keep-talking"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const loadFromStorage = useJournalStore((s) => s.loadFromStorage);
  const isHydrated = useJournalStore((s) => s.isHydrated);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Merriweather_400Regular,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    // Show our branded loading screen while fonts load and store hydrates
    if (fontsLoaded) {
      return <LoadingScreen />;
    }
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
