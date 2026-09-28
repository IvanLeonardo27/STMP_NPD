import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NavigationGate />
      </AuthProvider>
    </ThemeProvider>
  );
}

function NavigationGate() {
  const { isLoggedIn, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    SplashScreen.hideAsync();

    const inAuthGroup = pathname.startsWith('/(auth)') || pathname === '/login';

    if (!isLoggedIn && !inAuthGroup) {
      // If user hasn't logged in, redirect to Layar Login
      router.replace('/(auth)/login' as any);
    } else if (isLoggedIn && inAuthGroup) {
      // If username already stored in Shared Preferences, skip login and open Layar Utama
      router.replace('/(main)' as any);
    }
  }, [isLoggedIn, isReady, pathname]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#16181b',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#52c41a" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="game/index" />
      <Stack.Screen name="result/index" />
      <Stack.Screen name="highscores/index" />
    </Stack>
  );
}
