import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';

const JUMP_SOUND = require('@/assets/sounds/sound_jump.wav');
const BONUS_SOUND = require('@/assets/sounds/sound_bonus.wav');
const DROWN_SOUND = require('@/assets/sounds/sound_drown.wav');
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

  const playSafe = useCallback((player: ReturnType<typeof useAudioPlayer>) => {
    if (isMuted) return;
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Ignore autoplay errors or interrupted audio
    }
  }, [isMuted]);

  const playJump = useCallback(() => playSafe(jumpPlayer), [playSafe, jumpPlayer]);
  const playBonus = useCallback(() => playSafe(bonusPlayer), [playSafe, bonusPlayer]);
  const playDrown = useCallback(() => playSafe(drownPlayer), [playSafe, drownPlayer]);
  const playDeath = useCallback(() => playSafe(deathPlayer), [playSafe, deathPlayer]);
  const playWin = useCallback(() => playSafe(winPlayer), [playSafe, winPlayer]);
  const playTimeUp = useCallback(() => playSafe(timeUpPlayer), [playSafe, timeUpPlayer]);
  const playLava = useCallback(() => playSafe(lavaPlayer), [playSafe, lavaPlayer]);
  const playHighScore = useCallback(() => playSafe(highscorePlayer), [playSafe, highscorePlayer]);
  const playSquash = useCallback(() => playSafe(squashPlayer), [playSafe, squashPlayer]);
  const playSnake = useCallback(() => playSafe(snakePlayer), [playSafe, snakePlayer]);

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
