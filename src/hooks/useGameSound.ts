import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const JUMP_SOUND = require('@/assets/sounds/sound_jump.wav');
const BONUS_SOUND = require('@/assets/sounds/sound_bonus.wav');
const DROWN_SOUND = require('@/assets/sounds/sound_drown.mp3');
const DEATH_SOUND = require('@/assets/sounds/sound_death.wav');
const WIN_SOUND = require('@/assets/sounds/sound_win.wav');
const TIME_UP_SOUND = require('@/assets/sounds/sound_time_up.wav');
const LAVA_SOUND = require('@/assets/sounds/sound_lava.mp3');
const HIGHSCORE_SOUND = require('@/assets/sounds/sound_highscore.wav');
const SQUASH_SOUND = require('@/assets/sounds/sound_squash.mp3');
const SNAKE_SOUND = require('@/assets/sounds/sound_snake.mp3');

export function useGameSound(isMuted: boolean = false) {
  const jumpPlayer = useAudioPlayer(JUMP_SOUND);
  const bonusPlayer = useAudioPlayer(BONUS_SOUND);
  const drownPlayer = useAudioPlayer(DROWN_SOUND);
  const deathPlayer = useAudioPlayer(DEATH_SOUND);
  const winPlayer = useAudioPlayer(WIN_SOUND);
  const timeUpPlayer = useAudioPlayer(TIME_UP_SOUND);
  const lavaPlayer = useAudioPlayer(LAVA_SOUND);
  const highscorePlayer = useAudioPlayer(HIGHSCORE_SOUND);
  const squashPlayer = useAudioPlayer(SQUASH_SOUND);
  const snakePlayer = useAudioPlayer(SNAKE_SOUND);

  const playSafe = useCallback(
    (player: ReturnType<typeof useAudioPlayer>, webFallbackSrc?: string) => {
      if (isMuted) return;

      // 1. Reset position only if already played (prevents InvalidStateError on unloaded media)
      try {
        if (player.currentTime > 0) {
          player.seekTo(0).catch(() => {});
        }
      } catch {
        // Ignore seek error if metadata not ready yet
      }

      // 2. Play the sound via expo-audio player
      let isSuccess = false;
      try {
        player.play();
        isSuccess = true;
      } catch (err) {
        console.warn('[Audio] expo-audio play error:', err);
      }

      // 3. Web fallback: in case browser DOM requires native HTMLAudioElement
      if (!isSuccess && Platform.OS === 'web' && typeof window !== 'undefined' && typeof webFallbackSrc === 'string') {
        try {
          const webAudio = new window.Audio(webFallbackSrc);
          webAudio.volume = 1.0;
          webAudio.play().catch(() => {});
        } catch {
          // Ignore web audio error
        }
      }
    },
    [isMuted]
  );

  const playJump = useCallback(() => playSafe(jumpPlayer, JUMP_SOUND), [playSafe, jumpPlayer]);
  const playBonus = useCallback(() => playSafe(bonusPlayer, BONUS_SOUND), [playSafe, bonusPlayer]);
  const playDrown = useCallback(() => playSafe(drownPlayer, DROWN_SOUND), [playSafe, drownPlayer]);
  const playDeath = useCallback(() => playSafe(deathPlayer, DEATH_SOUND), [playSafe, deathPlayer]);
  const playWin = useCallback(() => playSafe(winPlayer, WIN_SOUND), [playSafe, winPlayer]);
  const playTimeUp = useCallback(() => playSafe(timeUpPlayer, TIME_UP_SOUND), [playSafe, timeUpPlayer]);
  const playLava = useCallback(() => playSafe(lavaPlayer, LAVA_SOUND), [playSafe, lavaPlayer]);
  const playHighScore = useCallback(() => playSafe(highscorePlayer, HIGHSCORE_SOUND), [playSafe, highscorePlayer]);
  const playSquash = useCallback(() => playSafe(squashPlayer, SQUASH_SOUND), [playSafe, squashPlayer]);
  const playSnake = useCallback(() => playSafe(snakePlayer, SNAKE_SOUND), [playSafe, snakePlayer]);

  return {
    playJump,
    playBonus,
    playDrown,
    playDeath,
    playWin,
    playTimeUp,
    playLava,
    playHighScore,
    playSquash,
    playSnake,
  };
}
