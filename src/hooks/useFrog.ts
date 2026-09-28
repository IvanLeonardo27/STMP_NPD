import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ControlMode,
  Direction,
  FlyBonusEntity,
  FrogState,
  LavaStoneEntity,
  LogEntity,
  SnakeEntity,
  VehicleEntity,
} from '@/types/game';

export const FROG_WIDTH = 50;
export const FROG_HEIGHT = 50;
export const HOP_STEP_X = 52;
export const HOP_STEP_Y = 52;
export const START_Y = 782;

export interface UseFrogOptions {
  playableWidth: number;
  vehicles: VehicleEntity[];
  logs?: LogEntity[];
  snake: SnakeEntity | null;
  lavaStones: LavaStoneEntity[];
  fly?: FlyBonusEntity | null;
  onEatFly?: (points: number) => void;
  onReachSafeZone?: () => void;
  onHop?: () => void;
  onDie?: (cause: 'squashed' | 'eaten' | 'burned' | 'drowned') => void;
  isPaused?: boolean;
  controlMode?: ControlMode;
}

export function useFrog({
  playableWidth,
  vehicles,
  logs = [],
  snake,
  lavaStones,
  fly = null,
  onEatFly,
  onReachSafeZone,
  onHop,
  onDie,
  isPaused = false,
  controlMode = 'arrows',
}: UseFrogOptions) {
  const initialX = Math.round(playableWidth / 2 - FROG_WIDTH / 2);

  const [frog, setFrog] = useState<FrogState>(() => ({
    x: initialX,
    y: START_Y,
    lane: 0,
    direction: 'up',
    isJumping: false,
    status: 'alive',
  }));

  const [deathReason, setDeathReason] = useState<string | null>(null);
  const [goalBanner, setGoalBanner] = useState<string | null>(null);

  // Authoritative mutable ref for 60 FPS physics & drifting (not clobbered by stale React renders)
  const frogRef = useRef<FrogState>({
    x: initialX,
    y: START_Y,
    lane: 0,
    direction: 'up',
    isJumping: false,
    status: 'alive',
  });

  const vehiclesRef = useRef(vehicles);
  const logsRef = useRef(logs);
  const lavaStonesRef = useRef(lavaStones);
  const snakeRef = useRef(snake);
  const flyRef = useRef(fly);
  const onEatFlyRef = useRef(onEatFly);
  const onReachSafeZoneRef = useRef(onReachSafeZone);
  const onHopRef = useRef(onHop);
  const onDieRef = useRef(onDie);

  useEffect(() => {
    vehiclesRef.current = vehicles;
    logsRef.current = logs;
    lavaStonesRef.current = lavaStones;
    snakeRef.current = snake;
    flyRef.current = fly;
    onEatFlyRef.current = onEatFly;
    onReachSafeZoneRef.current = onReachSafeZone;
    onHopRef.current = onHop;
    onDieRef.current = onDie;
  });

  const isGoalCelebratingRef = useRef<boolean>(false);

  const isJumpingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const respawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReachedCheckpointRef = useRef<boolean>(false);

  // Clean up timers on component unmount only
  useEffect(() => {
    return () => {
      if (isJumpingTimerRef.current) clearTimeout(isJumpingTimerRef.current);
      if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);
    };
  }, []);

  // Trigger death with reason and auto-respawn
  const triggerDeath = useCallback(
    (cause: 'squashed' | 'eaten' | 'burned' | 'drowned', reasonText: string) => {
      if (frogRef.current.status !== 'alive') return;

      setDeathReason(reasonText);
      const deadState: FrogState = {
        ...frogRef.current,
        status: cause,
        isJumping: false,
      };
      frogRef.current = deadState;
      setFrog(deadState);
      onDieRef.current?.(cause);

      if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);

      respawnTimerRef.current = setTimeout(() => {
        // If player already reached checkpoint and drowns in river, respawn at checkpoint rest area (Y: 262)
        const respawnY =
          hasReachedCheckpointRef.current && cause === 'drowned'
            ? 262
            : START_Y;

        const respawned: FrogState = {
          x: Math.round(playableWidth / 2 - FROG_WIDTH / 2),
          y: respawnY,
          lane: 0,
          direction: 'up',
          isJumping: false,
          status: 'alive',
        };
        frogRef.current = respawned;
        setFrog(respawned);
        setDeathReason(null);
      }, 1600);
    },
    [playableWidth]
  );

  // Movement actions
  const hop = useCallback(
    (dir: Direction) => {
      const current = frogRef.current;
      if (current.status !== 'alive' || isPaused || isGoalCelebratingRef.current) return;

      let nextX = current.x;
      let nextY = current.y;

      switch (dir) {
        case 'up':
          nextY = Math.max(20, current.y - HOP_STEP_Y);
          break;
        case 'down':
          nextY = Math.min(START_Y, current.y + HOP_STEP_Y);
          break;
        case 'left':
          nextX = Math.max(10, current.x - HOP_STEP_X);
          break;
        case 'right':
          nextX = Math.min(playableWidth - FROG_WIDTH - 10, current.x + HOP_STEP_X);
          break;
      }

      const hoppingState: FrogState = {
        ...current,
        x: nextX,
        y: nextY,
        direction: dir,
        isJumping: true,
      };
      frogRef.current = hoppingState;
      setFrog(hoppingState);
      onHopRef.current?.();

      if (isJumpingTimerRef.current) clearTimeout(isJumpingTimerRef.current);
      isJumpingTimerRef.current = setTimeout(() => {
        setFrog((prev) => {
          const landed: FrogState = { ...prev, isJumping: false };
          frogRef.current = landed;
          return landed;
        });
      }, 140);
    },
    [playableWidth, isPaused]
  );

  // 1. Keyboard Controls (WASD or Arrows)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (controlMode === 'swipe') return; // Keyboard movement disabled in swipe mode

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      if (controlMode === 'wasd') {
        switch (e.key) {
          case 'w':
          case 'W':
            e.preventDefault();
            hop('up');
            break;
          case 's':
          case 'S':
            e.preventDefault();
            hop('down');
            break;
          case 'a':
          case 'A':
            e.preventDefault();
            hop('left');
            break;
          case 'd':
          case 'D':
            e.preventDefault();
            hop('right');
            break;
        }
      } else if (controlMode === 'arrows') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            hop('up');
            break;
          case 'ArrowDown':
            e.preventDefault();
            hop('down');
            break;
          case 'ArrowLeft':
            e.preventDefault();
            hop('left');
            break;
          case 'ArrowRight':
            e.preventDefault();
            hop('right');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hop, isPaused, controlMode]);

  // 2. Mouse Drag / Cursor Swipe Controls (for Desktop Web in swipe mode)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (controlMode !== 'swipe') return;

    let startX = 0;
    let startY = 0;
    let isMouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (isPaused) return;
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown || isPaused) return;
      isMouseDown = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const minDistance = 20;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minDistance) hop('right');
        else if (dx < -minDistance) hop('left');
      } else {
        if (dy > minDistance) hop('down');
        else if (dy < -minDistance) hop('up');
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hop, isPaused, controlMode]);

  // Collision detection loop
  useEffect(() => {
    if (isPaused) return;

    let animId: number;

    const checkCollisions = () => {
      animId = requestAnimationFrame(checkCollisions);

      const current = frogRef.current;
      if (current.status !== 'alive') {
        return;
      }

      const frogBox = {
        left: current.x + 8,
        right: current.x + FROG_WIDTH - 8,
        top: current.y + 8,
        bottom: current.y + FROG_HEIGHT - 8,
        centerX: current.x + FROG_WIDTH / 2,
        centerY: current.y + FROG_HEIGHT / 2,
      };

      // Reset checkpoint if player is at start sidewalk
      if (current.y >= START_Y - 10) {
        hasReachedCheckpointRef.current = false;
      }

      // Check if player reached the Safe Checkpoint Grass (Y ~ 250 to 302)
      if (frogBox.centerY >= 250 && frogBox.centerY < 302) {
        hasReachedCheckpointRef.current = true;
      }

      // 0. SAFE ZONE / FINISH REACHED CHECK (Finish Zone: Y <= 85)
      // When frog hops into the top safe grass zone from the river log in 1 hop!
      if (frogBox.centerY <= 85 && !current.isJumping) {
        if (!isGoalCelebratingRef.current) {
          isGoalCelebratingRef.current = true;
          setGoalBanner('🎉 BERHASIL SAMPAI KE SAFE ZONE! (+1 POIN)');
          onReachSafeZoneRef.current?.();

          setTimeout(() => {
            hasReachedCheckpointRef.current = false;
            isGoalCelebratingRef.current = false;
            setGoalBanner(null);

            const newFrog: FrogState = {
              x: Math.round(playableWidth / 2 - FROG_WIDTH / 2),
              y: START_Y,
              lane: 0,
              direction: 'up',
              isJumping: false,
              status: 'alive',
            };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }, 800);
        }
        return;
      }

      // 1. VEHICLE COLLISION CHECK (Highway Zone: vehicles exist at Y ~ 552 to 752)
      const frogVehicleBox = {
        left: current.x + 3,
        right: current.x + FROG_WIDTH - 3,
        top: current.y + 3,
        bottom: current.y + FROG_HEIGHT - 3,
      };

      for (const v of vehiclesRef.current) {
        const vLeft = v.x + 2;
        const vRight = v.x + v.width - 2;
        const vTop = 552 + v.laneY - 2;
        const vBottom = 552 + v.laneY + v.height + 2;

        // Check AABB box overlap
        const overlaps =
          frogVehicleBox.left < vRight &&
          frogVehicleBox.right > vLeft &&
          frogVehicleBox.top < vBottom &&
          frogVehicleBox.bottom > vTop;

        if (overlaps) {
          triggerDeath('squashed', '💥 TERLINDAS KENDARAAN!');
          return;
        }
      }

      // 2. SNAKE COLLISION CHECK (Middle Grass Zone: Y ~ 462 to 552)
      if (snakeRef.current) {
        const s = snakeRef.current;
        const sLeft = s.x + 6;
        const sRight = s.x + s.width - 6;
        const sTop = 462 + s.y + 2;
        const sBottom = 462 + s.y + s.height - 2;

        const overlaps =
          frogVehicleBox.left < sRight &&
          frogVehicleBox.right > sLeft &&
          frogVehicleBox.top < sBottom &&
          frogVehicleBox.bottom > sTop;

        if (overlaps) {
          triggerDeath('eaten', '🐍 TERMAKAN ULAR!');
          return;
        }
      }

      // 3. LAVA COLLISION CHECK (Lava Zone: Y ~ 302 to 462)
      // Only check once frog is not airborne (landed)
      if (frogBox.centerY >= 302 && frogBox.centerY < 462 && !current.isJumping) {
        let standingStone: LavaStoneEntity | null = null;

        for (const stone of lavaStonesRef.current) {
          const stoneLeft = stone.x - 6;
          const stoneRight = stone.x + stone.width + 6;
          const stoneTop = 302 + stone.y - 6;
          const stoneBottom = 302 + stone.y + stone.height + 6;

          const insideStone =
            frogBox.centerX >= stoneLeft &&
            frogBox.centerX <= stoneRight &&
            frogBox.centerY >= stoneTop &&
            frogBox.centerY <= stoneBottom;

          if (insideStone) {
            standingStone = stone;
            break;
          }
        }

        // Case A: Frog jumped onto lava with NO stone under it
        if (!standingStone) {
          triggerDeath('burned', '🔥 MASUK KE LAVA!');
          return;
        }

        // Case B: Frog is standing on a stone, but the stone sinks/submerges!
        const isStoneSafe =
          (standingStone.state === 'emerged' ||
            standingStone.state === 'sinking' ||
            (standingStone.state === 'emerging' && standingStone.scale > 0.6)) &&
          standingStone.scale > 0.35;

        if (!isStoneSafe) {
          triggerDeath('burned', '🔥 BATU TENGGELAM, MASUK LAVA!');
          return;
        }
      }

      // 4. RIVER COLLISION CHECK & LOG RIDING (River Zone: Y ~ 85 to 250)
      // Only check once frog is not airborne (landed)
      if (frogBox.centerY >= 85 && frogBox.centerY < 250 && !current.isJumping) {
        let currentLog: LogEntity | null = null;

        for (const log of logsRef.current) {
          const logLeft = log.x - 8;
          const logRight = log.x + log.width + 8;
          const logTop = 85 + log.rowY - 12;
          const logBottom = 85 + log.rowY + log.height + 12;

          const insideLog =
            frogBox.centerX >= logLeft &&
            frogBox.centerX <= logRight &&
            frogBox.centerY >= logTop &&
            frogBox.centerY <= logBottom;

          if (insideLog) {
            currentLog = log;
            break;
          }
        }

        if (!currentLog) {
          // Frog landed in water with no log under it
          triggerDeath('drowned', '🌊 TENGGELAM DI AIR!');
          return;
        } else {
          // Bonus Fly Collision Check (Frog is safely on a log with the fly)
          const activeFly = flyRef.current;
          if (activeFly) {
            const flyLeft = activeFly.x - 6;
            const flyRight = activeFly.x + activeFly.width + 6;
            const flyTop = 85 + activeFly.y - 6;
            const flyBottom = 85 + activeFly.y + activeFly.height + 6;

            const overlapsFly =
              frogBox.right > flyLeft &&
              frogBox.left < flyRight &&
              frogBox.bottom > flyTop &&
              frogBox.top < flyBottom;

            if (overlapsFly) {
              onEatFlyRef.current?.(activeFly.points);
            }
          }

          // Riding the moving log: frog moves along with the log's speed and direction
          const driftSpeed = currentLog.direction === 'right' ? currentLog.speed : -currentLog.speed;
          const nextFrogX = frogRef.current.x + driftSpeed;

          // If frog stays still until reaching the edge border:
          // Pushed against the border, slips off the log, and falls into the river water!
          if (nextFrogX <= 2 || nextFrogX >= playableWidth - FROG_WIDTH - 2) {
            triggerDeath('drowned', '🌊 TERDORONG KE AIR!');
            return;
          } else {
            // Update frogRef and state synchronously for 60fps smooth drifting
            const driftedFrog: FrogState = { ...frogRef.current, x: nextFrogX };
            frogRef.current = driftedFrog;
            setFrog(driftedFrog);
          }
        }
      }
    };

    animId = requestAnimationFrame(checkCollisions);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused, triggerDeath, playableWidth]);

  const resetFrog = useCallback(() => {
    if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);
    hasReachedCheckpointRef.current = false;
    isGoalCelebratingRef.current = false;
    const initial: FrogState = {
      x: Math.round(playableWidth / 2 - FROG_WIDTH / 2),
      y: START_Y,
      lane: 0,
      direction: 'up',
      isJumping: false,
      status: 'alive',
    };
    frogRef.current = initial;
    setFrog(initial);
    setDeathReason(null);
    setGoalBanner(null);
  }, [playableWidth]);

  return {
    frog,
    deathReason,
    goalBanner,
    resetFrog,
    hopUp: () => hop('up'),
    hopDown: () => hop('down'),
    hopLeft: () => hop('left'),
    hopRight: () => hop('right'),
    hop,
  };

}
