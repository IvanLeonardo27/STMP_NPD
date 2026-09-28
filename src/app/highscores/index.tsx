import { useRouter } from 'expo-router';
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

import { getTopHighScores, HighScoreItem } from '@/services/storage';

const RANK_IMAGES: Record<number, any> = {
  1: require('@/assets/images/medals/rank_1.png'),
  2: require('@/assets/images/medals/rank_2.png'),
  3: require('@/assets/images/medals/rank_3.png'),
};

export default function HighScoresScreen() {
  const router = useRouter();
  const [highScores, setHighScores] = useState<HighScoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTopHighScores().then((scores) => {
      setHighScores(scores);
      setIsLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Papan Skor</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.pageTitle}>HIGH SCORES</Text>
          <Text style={styles.pageSubtitle}>
            Tiga Skor Tertinggi Teratas (Shared Preferences)
          </Text>
        </View>

        {/* Leaderboard Cards */}
        <View style={styles.listContainer}>
          {highScores.length === 0 && !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🐸</Text>
              <Text style={styles.emptyText}>Belum Ada Skor Tercatat</Text>
              <Text style={styles.emptySubtext}>
                Mainkan game dan seberangkan katak untuk mencatatkan rekor pertamamu!
              </Text>
            </View>
          ) : (
            highScores.map((item, index) => {
              const rank = item.rank || index + 1;
              const medalImage = RANK_IMAGES[rank] || RANK_IMAGES[3];

              return (
                <View
                  key={item.id || index.toString()}
                  style={[
                    styles.scoreCard,
                    rank === 1 && styles.scoreCardGold,
                    rank === 2 && styles.scoreCardSilver,
                    rank === 3 && styles.scoreCardBronze,
                  ]}
                >
                  {/* Gambar Ranking 1, 2, atau 3 */}
                  <View style={styles.medalWrapper}>
                    <Image
                      source={medalImage}
                      style={styles.medalImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Nama Pemain & Info */}
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {item.username}
                    </Text>
                    <Text style={styles.playerDate}>
                      {item.date || 'Baru saja'}
                    </Text>
                  </View>

                  {/* Skor */}
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreNumber}>{item.score}</Text>
                    <Text style={styles.scoreUnit}>POIN</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/game' as any)}
            style={styles.playAgainButton}
          >
            <Text style={styles.playAgainButtonText}>🎮 MAIN GAME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/(main)' as any)}
            style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>🏠 Menu Utama</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#24292f',
    backgroundColor: '#1b1f24',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2d333b',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  pageTitle: {
    color: '#ffd700',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pageSubtitle: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    maxWidth: 380,
    gap: 14,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f242c',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#363d47',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCardGold: {
    borderColor: '#ffd700',
    backgroundColor: '#262215',
  },
  scoreCardSilver: {
    borderColor: '#c0c0c0',
    backgroundColor: '#202428',
  },
  scoreCardBronze: {
    borderColor: '#cd7f32',
    backgroundColor: '#251e18',
  },
  medalWrapper: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  medalImage: {
    width: 52,
    height: 52,
  },
  playerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playerDate: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 3,
  },
  scoreBadge: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  scoreNumber: {
    color: '#ffd700',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scoreUnit: {
    color: '#8b949e',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#1f242c',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#363d47',
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtext: {
    color: '#8b949e',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  actionButtonsContainer: {
    width: '100%',
    maxWidth: 380,
    marginTop: 30,
    gap: 12,
  },
  playAgainButton: {
    backgroundColor: '#52c41a',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#52c41a',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  playAgainButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  menuButton: {
    backgroundColor: '#272b32',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3c434f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '700',
  },
});
