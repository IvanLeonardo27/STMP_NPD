import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { recordScore } from '@/services/storage';
import { getPlayerTitleInfo } from '@/utils/playerTitle';

export default function ResultScreen() {
  const router = useRouter();
  const { username } = useAuth();
  const params = useLocalSearchParams<{ score?: string; frogsSaved?: string }>();

  const score = parseInt(params.score || '0', 10);
  const frogsSaved = parseInt(params.frogsSaved || '0', 10);

  const titleInfo = getPlayerTitleInfo(frogsSaved);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState<number | null>(null);

  useEffect(() => {
    recordScore(username || 'Player', score).then((res) => {
      setIsNewHighScore(res.isNewHighScore);
      setPreviousHighScore(res.previousHighScore);
    });
  }, [score, username]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Icon / Hero */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('@/assets/images/frog/frog_idle.png')}
            style={styles.heroFrog}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.statusTitle}>PERMAINAN SELESAI</Text>
        <Text style={styles.playerNameText}>Pemain: {username || 'Player'}</Text>

        {/* Main Result Card */}
        <View style={styles.resultCard}>
          {/* New High Score Badge */}
          {isNewHighScore && score > 0 && (
            <View style={styles.highScoreBanner}>
              <Text style={styles.highScoreBannerText}>
                🎉 REKOR TERTINGGI BARU! 🎉
              </Text>
            </View>
          )}

          {/* Final Score */}
          <Text style={styles.scoreLabel}>SKOR AKHIR</Text>
          <Text style={styles.scoreValue}>{score}</Text>

          {previousHighScore !== null && previousHighScore > 0 && (
            <Text style={styles.previousScoreText}>
              Rekor Sebelumnya: {previousHighScore} Poin
            </Text>
          )}

          <View style={styles.divider} />

          {/* Gelar Pemain */}
          <View style={styles.titleSection}>
            <Text style={styles.titleSectionLabel}>GELAR YANG DIPEROLEH</Text>
            <View
              style={[
                styles.titleBadgePill,
                { borderColor: titleInfo.color, shadowColor: titleInfo.color },
              ]}
            >
              <Text style={styles.titleBadgeIcon}>{titleInfo.badge}</Text>
              <Text style={[styles.titleBadgeText, { color: titleInfo.color }]}>
                {titleInfo.title}
              </Text>
            </View>
            <Text style={styles.titleDescText}>{titleInfo.description}</Text>
          </View>

          {/* Frogs Rescued Count */}
          <View style={styles.statBox}>
            <Text style={styles.statBoxEmoji}>🐸</Text>
            <Text style={styles.statBoxText}>
              {frogsSaved} Katak Berhasil Diseberangkan
            </Text>
          </View>
        </View>

        {/* 3 Action Buttons Sesuai Ketentuan */}
        <View style={styles.actionsContainer}>
          {/* 1. Tombol Play Again */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/game' as any)}
            style={styles.playAgainBtn}
          >
            <Text style={styles.playAgainText}>🔁 Play Again</Text>
          </TouchableOpacity>

          {/* 2. Tombol High Scores */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/highscores' as any)}
            style={styles.highScoresBtn}
          >
            <Text style={styles.highScoresText}>🏆 High Scores</Text>
          </TouchableOpacity>

          {/* 3. Tombol Main Menu */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/(main)' as any)}
            style={styles.mainMenuBtn}
          >
            <Text style={styles.mainMenuText}>🏠 Main Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#141619',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#20262e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52c41a',
    marginBottom: 12,
  },
  heroFrog: {
    width: 70,
    height: 70,
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  playerNameText: {
    color: '#8b949e',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
    fontWeight: '600',
  },
  resultCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1c2128',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  highScoreBanner: {
    backgroundColor: '#ffd700',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#ffd700',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  highScoreBannerText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scoreLabel: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  previousScoreText: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#30363d',
    marginVertical: 16,
  },
  titleSection: {
    alignItems: 'center',
    width: '100%',
  },
  titleSectionLabel: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  titleBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  titleBadgeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  titleBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  titleDescText: {
    color: '#c9d1d9',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2d333b',
  },
  statBoxEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  statBoxText: {
    color: '#7ee787',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 380,
    marginTop: 24,
    gap: 12,
  },
  playAgainBtn: {
    backgroundColor: '#52c41a',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#52c41a',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  playAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  highScoresBtn: {
    backgroundColor: '#21262d',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  highScoresText: {
    color: '#ffd700',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainMenuBtn: {
    backgroundColor: '#272b32',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3c434f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainMenuText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '700',
  },
});
