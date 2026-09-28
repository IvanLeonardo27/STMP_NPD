import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) return null;

  return <Redirect href={(isLoggedIn ? '/(main)' : '/(auth)/login') as any} />;
}
