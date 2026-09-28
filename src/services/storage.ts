import AsyncStorage from '@react-native-async-storage/async-storage';
import { ControlMode } from '@/types/game';

const USERNAME_KEY = 'username';
const HIGH_SCORES_KEY = 'high_scores';
const CONTROL_MODE_KEY = 'control_mode';

export interface HighScoreItem {
  id: string;
  rank?: number;
  username: string;
  score: number;
  date: string;
}

// User Session (Shared Preferences)
export async function getStoredUsername(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USERNAME_KEY);
  } catch (error) {
    console.error('Error reading username from AsyncStorage', error);
    return null;
  }
}

export async function storeUsername(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username.trim());
  } catch (error) {
    console.error('Error saving username to AsyncStorage', error);
    throw error;
  }
}

export async function clearUsername(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USERNAME_KEY);
  } catch (error) {
    console.error('Error removing username from AsyncStorage', error);
    throw error;
  }
}

// High Scores (Top 3)
export async function getTopHighScores(): Promise<HighScoreItem[]> {
  try {
    const data = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    if (!data) return [];
    const parsed: HighScoreItem[] = JSON.parse(data);
    return parsed
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  } catch (error) {
    console.error('Error reading high scores from AsyncStorage', error);
    return [];
  }
}

export async function recordScore(
  username: string,
  score: number
): Promise<{ isNewHighScore: boolean; previousHighScore: number; scores: HighScoreItem[] }> {
  try {
    const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    let allScores: HighScoreItem[] = raw ? JSON.parse(raw) : [];
    const normalizedName = (username || 'Player').trim();

    // Cek skor tertinggi pemain ini sebelumnya
    const existingIndex = allScores.findIndex(
      (item) => item.username.toLowerCase() === normalizedName.toLowerCase()
    );

    let isNewHighScore = false;
    let previousHighScore = 0;

    if (existingIndex !== -1) {
      previousHighScore = allScores[existingIndex].score;
      // Apabila skor saat ini lebih tinggi dari skor yang pernah diraih sebelumnya, simpan skor tersebut
      if (score > previousHighScore) {
        allScores[existingIndex].score = score;
        allScores[existingIndex].date = new Date().toLocaleDateString('id-ID');
        isNewHighScore = true;
      }
    } else {
      // Pemain baru: simpan skor pertama jika > 0
      if (score > 0) {
        allScores.push({
          id: Date.now().toString(),
          username: normalizedName,
          score,
          date: new Date().toLocaleDateString('id-ID'),
        });
        isNewHighScore = true;
      }
    }

    // Urutkan skor tertinggi dan simpan ke AsyncStorage
    allScores.sort((a, b) => b.score - a.score);
    await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(allScores));

    const top3 = allScores.slice(0, 3).map((item, idx) => ({ ...item, rank: idx + 1 }));
    return { isNewHighScore, previousHighScore, scores: top3 };
  } catch (error) {
    console.error('Error saving high score to AsyncStorage', error);
    return { isNewHighScore: false, previousHighScore: 0, scores: [] };
  }
}

// Control Settings (WASD, Arrows, Swipe)
export async function getStoredControlMode(): Promise<ControlMode> {
  try {
    const val = await AsyncStorage.getItem(CONTROL_MODE_KEY);
    if (val === 'wasd' || val === 'arrows' || val === 'swipe') {
      return val;
    }
    return 'arrows'; // Default to arrow keys
  } catch (error) {
    console.error('Error reading control mode from AsyncStorage', error);
    return 'arrows';
  }
}

export async function storeControlMode(mode: ControlMode): Promise<void> {
  try {
    await AsyncStorage.setItem(CONTROL_MODE_KEY, mode);
  } catch (error) {
    console.error('Error saving control mode to AsyncStorage', error);
  }
}

