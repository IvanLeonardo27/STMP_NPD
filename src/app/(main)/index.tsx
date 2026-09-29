import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import SettingsModal from '@/components/game/SettingsModal';
import { getStoredControlMode, storeControlMode } from '@/services/storage';
import { ControlMode } from '@/types/game';

export default function MainHomeScreen() {
  const { username, logout } = useAuth();
  const router = useRouter();
  const [controlMode, setControlMode] = useState<ControlMode>('arrows');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  React.useEffect(() => {
    getStoredControlMode().then(setControlMode);
  }, []);

  const handleSelectControlMode = async (mode: ControlMode) => {
    setControlMode(mode);
    await storeControlMode(mode);
  };

  const handlePlayGame = () => {
    const title = 'Cara Bermain Froggy Crosser';
    const message =
      '1. Usap layar (swipe) ke atas, bawah, kiri, dan kanan untuk menggerakkan katak.\n' +
      '2. Hindari kendaraan di jalan raya (mobil, truk, mobil balap).\n' +
      '3. Pijak batu di atas zona lava dan melompatlah di atas batang kayu terapung di sungai.\n' +
      '4. Seberangkan katak sebanyak mungkin ke garis finish sebelum waktu habis!';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}\n\nKlik OK untuk mulai bermain!`);
      if (confirmed) {
        router.push('/game');
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Batal', style: 'cancel' },
        { text: 'OK', onPress: () => router.push('/game') },
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Top Bar with Username and Logout */}
      <View style={styles.topBar}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerLabel}>Pemain Aktif:</Text>
          <Text style={styles.playerName}>{username || 'Guest'}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Log Out 🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.frogHero}>
          <Image
            source={require('@/assets/images/frog/frog_idle.png')}
            style={styles.heroFrogImg}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Froggy Crosser</Text>
        <Text style={styles.subtitle}>Selamat datang, {username}!</Text>

        <View style={styles.actionCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePlayGame}
            style={styles.playButton}
          >
            <Text style={styles.playButtonText}>PLAY GAME 🎮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/highscores' as any)}
            style={styles.highScoresButton}
          >
            <Text style={styles.highScoresButtonText}>🏆 Papan Skor (High Scores)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsSettingsOpen(true)}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsButtonText}>
              ⚙️ Kontrol:{' '}
              {controlMode === 'wasd'
                ? 'Keyboard WASD'
                : controlMode === 'arrows'
                ? 'Tombol Panah'
                : 'Swipe Mouse / Layar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SettingsModal
        visible={isSettingsOpen}
        currentMode={controlMode}
        onSelectMode={handleSelectControlMode}
        onClose={() => setIsSettingsOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#16181b',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1f2328',
    borderBottomWidth: 1,
    borderBottomColor: '#2d333b',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerLabel: {
    color: '#9ba0a6',
    fontSize: 13,
  },
  playerName: {
    color: '#8ce258',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: '#30363d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#f85149',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  frogHero: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#21252b',
    borderWidth: 3,
    borderColor: '#52c41a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#52c41a',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroFrogImg: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8ce258',
    marginTop: 6,
    marginBottom: 28,
    fontWeight: '600',
  },
  actionCard: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  playButton: {
    backgroundColor: '#52c41a',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#52c41a',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  highScoresButton: {
    backgroundColor: '#1c2128',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  highScoresButtonText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: '#1f242b',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#434d5d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#f0b232',
    fontSize: 13,
    fontWeight: '700',
  },
});
