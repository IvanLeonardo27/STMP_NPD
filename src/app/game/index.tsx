import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GameMap, { PLAYABLE_WIDTH } from '@/components/game/GameMap';
import SettingsModal from '@/components/game/SettingsModal';
import TutorialModal from '@/components/game/TutorialModal';
import { useAuth } from '@/context/AuthContext';
import { useFlyBonus } from '@/hooks/useFlyBonus';
import { useFrog } from '@/hooks/useFrog';
import { useGameSound } from '@/hooks/useGameSound';
import { useLavaStones } from '@/hooks/useLavaStones';
import { useLogs } from '@/hooks/useLogs';
import { useSnake } from '@/hooks/useSnake';
import { useVehicles } from '@/hooks/useVehicles';
import {
  getStoredControlMode,
  getStoredTutorialDisabled,
  recordScore,
  storeControlMode,
  storeTutorialDisabled,
} from '@/services/storage';
import { ControlMode } from '@/types/game';

const TOTAL_GAME_TIME = 120;

export default function GameScreen() {
  const router = useRouter();
  const { username } = useAuth();
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_GAME_TIME);
  const [frogsSaved, setFrogsSaved] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { playJump, playBonus, playDrown, playDeath, playWin, playTimeUp, playLava, playHighScore, playSquash, playSnake } = useGameSound(isMuted);
  const [isPaused, setIsPaused] = useState(false);
  const [controlMode, setControlMode] = useState<ControlMode>('arrows');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isTutorialChecked, setIsTutorialChecked] = useState(false);
  const hasRecordedScoreRef = useRef(false);

  // Load saved tutorial display preference
  useEffect(() => {
    getStoredTutorialDisabled().then((disabled) => {
      setIsTutorialChecked(true);
      if (!disabled) {
        setIsTutorialOpen(true);
      }
    });
  }, []);

  const isTimeUp = timeRemaining <= 0;
  const isGamePaused = !isTutorialChecked || isTutorialOpen || isPaused || isTimeUp;

  // Active countdown timer: runs from 120s down to 0s while game is active
  useEffect(() => {
    if (isGamePaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGamePaused, timeRemaining <= 0]);

  // Load saved control mode preference
  useEffect(() => {
    getStoredControlMode().then((mode) => {
      setControlMode(mode);
    });
  }, []);

  const handleSelectControlMode = async (mode: ControlMode) => {
    setControlMode(mode);
    await storeControlMode(mode);
  };

  // Record score automatically and check if it's a new high score when time runs out
  useEffect(() => {
    if (isTimeUp && !hasRecordedScoreRef.current) {
      hasRecordedScoreRef.current = true;
      recordScore(username || 'Player', score).then((res) => {
        if (res.isNewHighScore && score > 0) {
          setIsNewHighScore(true);
          playHighScore();
        } else {
          playTimeUp();
        }
      });
    }
  }, [isTimeUp, score, username, playTimeUp, playHighScore]);

  // Dynamic vehicles moving horizontally across all 3 lanes
  const vehicles = useVehicles(PLAYABLE_WIDTH, isGamePaused);


  // Dynamic wood logs floating across 3 river rows with 2-3 logs per stream
  const logs = useLogs(PLAYABLE_WIDTH, isGamePaused);

  // Dynamic bonus fly appearing on wood logs in river zone
  const { fly, eatenPopup, eatFly } = useFlyBonus(logs, PLAYABLE_WIDTH, isGamePaused);

  // Dynamic patrolling snake roaming horizontally and vertically in middle grass
  const snake = useSnake(PLAYABLE_WIDTH, isGamePaused);

  // Dynamic whack-a-mole stepping stones emerging and submerging in lava
  const lavaStones = useLavaStones({ isPaused: isGamePaused });

  // Dynamic frog with 4-way movement, jump animations, keyboard/swipe controls, and failure collisions
  const { frog, deathReason, goalBanner, hop, resetFrog } = useFrog({
    playableWidth: PLAYABLE_WIDTH,
    vehicles,
    logs,
    snake,
    lavaStones,
    fly,
    onEatFly: (points) => {
      const awarded = eatFly();
      if (awarded) {
        playBonus();
        setScore((prev) => prev + awarded);
      }
    },
    onReachSafeZone: () => {
      playWin();
      setScore((prev) => prev + 1);
      setFrogsSaved((prev) => prev + 1);
    },
    onHop: playJump,
    onDie: (cause) => {
      if (cause === 'squashed') {
        playSquash();
      } else if (cause === 'eaten') {
        playSnake();
      } else if (cause === 'drowned') {
        playDrown();
      } else if (cause === 'burned') {
        playLava();
      } else {
        playDeath();
      }
    },
    isPaused: isGamePaused,
    controlMode,
  });

  const handleStartGame = async (dontShowAgain: boolean) => {
    setIsTutorialOpen(false);
    if (dontShowAgain) {
      await storeTutorialDisabled(true);
    }
  };

  const handleRestart = () => {
    hasRecordedScoreRef.current = false;
    setIsNewHighScore(false);
    setScore(0);
    setTimeRemaining(TOTAL_GAME_TIME);
    setFrogsSaved(0);
    setIsPaused(false);
    resetFrog();
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GameMap
          score={score}
          timeRemaining={timeRemaining}
          totalTime={TOTAL_GAME_TIME}
          frogsSaved={frogsSaved}
          isMuted={isMuted}
          isPaused={isGamePaused}
          vehicles={vehicles}
          logs={logs}
          snake={snake}
          lavaStones={lavaStones}
          fly={fly}
          eatenPopup={eatenPopup}
          frog={frog}
          deathReason={deathReason}
          goalBanner={goalBanner}
          controlMode={controlMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onSwipe={hop}
          onRestart={handleRestart}
          onOpenHighScores={() => router.push('/highscores' as any)}
          onMainMenu={() => router.replace('/(main)' as any)}
          isNewHighScore={isNewHighScore}
          onToggleSound={() => setIsMuted((prev) => !prev)}
          onTogglePause={() => setIsPaused((prev) => !prev)}
        />


      </ScrollView>

      {/* Control Mode Settings Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        currentMode={controlMode}
        onSelectMode={handleSelectControlMode}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        visible={isTutorialOpen}
        controlMode={controlMode}
        onStartGame={handleStartGame}
        onClose={() => setIsTutorialOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1b1e22',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
