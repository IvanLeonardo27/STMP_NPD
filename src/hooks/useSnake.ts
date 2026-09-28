import { useEffect, useRef, useState } from 'react';
import { SnakeEntity } from '@/types/game';

const SNAKE_WIDTH = 110;
const SNAKE_HEIGHT = 28;
const MIN_Y = 6;
const MAX_Y = 56; // 90px grass height - 28px snake height - 6px padding

export function useSnake(playableWidth: number, isPaused: boolean = false) {
  const [snake, setSnake] = useState<SnakeEntity>(() => {
    // Initial spawn: starts in middle of screen moving in random direction
    const initialDirection = Math.random() > 0.5 ? 'right' : 'left';
    return {
      id: 'snake-1',
      x: playableWidth * 0.35,
      y: 20 + Math.random() * 20,
      width: SNAKE_WIDTH,
      height: SNAKE_HEIGHT,
      speedX: 0.6,
      direction: initialDirection,
    };
  });

  const stateRef = useRef({
    snake,
    targetY: 25,
    baseY: 25,
    vy: 0.2,
    slitherPhase: 0,
    cooldownFrames: 0,
  });

  // Keep stateRef up to date with the latest state
  stateRef.current.snake = snake;

  useEffect(() => {
    if (isPaused) return;

    let animId: number;

    const update = () => {
      const state = stateRef.current;
      const current = state.snake;

      // If waiting in cooldown between exits/respawns
      if (state.cooldownFrames > 0) {
        state.cooldownFrames--;
        animId = requestAnimationFrame(update);
        return;
      }

      // 1. Horizontal Movement (Kanan / Kiri)
      let nextX = current.x;
      if (current.direction === 'right') {
        nextX += current.speedX;
      } else {
        nextX -= current.speedX;
      }

      // Check if snake completely exited the screen
      const exitedRight = current.direction === 'right' && nextX > playableWidth + 30;
      const exitedLeft = current.direction === 'left' && nextX < -current.width - 30;

      let nextDirection = current.direction;
      let nextSpeedX = current.speedX;

      if (exitedRight || exitedLeft) {
        // Random direction for next entrance (can emerge from right or left)
        nextDirection = Math.random() > 0.5 ? 'right' : 'left';
        nextSpeedX = 0.5 + Math.random() * 0.2;

        if (nextDirection === 'right') {
          // Emerge from left edge moving right
          nextX = -current.width - 20 - Math.random() * 30;
        } else {
          // Emerge from right edge moving left
          nextX = playableWidth + 20 + Math.random() * 30;
        }

        // Pick new random Y for entrance
        state.baseY = MIN_Y + Math.random() * (MAX_Y - MIN_Y);
        state.targetY = MIN_Y + Math.random() * (MAX_Y - MIN_Y);
        state.vy = 0.15 + Math.random() * 0.12;
        state.cooldownFrames = Math.floor(45 + Math.random() * 45); // 0.8 - 1.5s breather
      }

      // 2. Vertical Movement (Random Atas / Bawah)
      // Steer baseY smoothly towards targetY
      if (Math.abs(state.baseY - state.targetY) < 1.5) {
        // Pick new target Y in random position within grass bounds
        state.targetY = MIN_Y + Math.random() * (MAX_Y - MIN_Y);
        state.vy = 0.15 + Math.random() * 0.12;
      } else if (state.baseY < state.targetY) {
        state.baseY = Math.min(MAX_Y, state.baseY + state.vy);
      } else {
        state.baseY = Math.max(MIN_Y, state.baseY - state.vy);
      }

      // Add gentle sine undulation for natural slithering effect
      state.slitherPhase += 0.025;
      const slitherWave = Math.sin(state.slitherPhase) * 3;
      const nextY = Math.max(MIN_Y, Math.min(MAX_Y, state.baseY + slitherWave));

      const updatedSnake: SnakeEntity = {
        ...current,
        x: nextX,
        y: nextY,
        direction: nextDirection,
        speedX: nextSpeedX,
      };

      setSnake(updatedSnake);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playableWidth, isPaused]);

  return snake;
}
