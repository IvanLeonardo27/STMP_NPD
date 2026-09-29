import { useCallback, useEffect, useRef, useState } from 'react';
import { EatenScorePopup, FlyBonusEntity, LogEntity } from '@/types/game';

export const FLY_WIDTH = 34;
export const FLY_HEIGHT = 26;
export const FLY_POINTS = 1;
export const FLY_DURATION_MS = 6000;
export const FLY_COOLDOWN_MS = 8000;

export function useFlyBonus(
  logs: LogEntity[],
  playableWidth: number,
  isPaused: boolean = false
) {
  const [fly, setFly] = useState<FlyBonusEntity | null>(null);
  const [eatenPopup, setEatenPopup] = useState<EatenScorePopup | null>(null);

  const targetLogIdRef = useRef<string | null>(null);
  const spawnTimeRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logsRef = useRef(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  // Function to consume the fly when frog collides with it
  const eatFly = useCallback(() => {
    if (!targetLogIdRef.current) return null;

    const currentLog = logsRef.current.find((l) => l.id === targetLogIdRef.current);
    const popupX = currentLog
      ? currentLog.x + (currentLog.width - FLY_WIDTH) / 2
      : playableWidth / 2;
    const popupY = currentLog ? currentLog.rowY : 50;

    // Trigger floating +200 popup
    const popupData: EatenScorePopup = {
      id: Date.now(),
      x: popupX,
      y: popupY,
      points: FLY_POINTS,
    };
    setEatenPopup(popupData);

    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setEatenPopup(null);
    }, 1200);

    // Despawn fly and set next cooldown
    targetLogIdRef.current = null;
    setFly(null);
    nextSpawnTimeRef.current = Date.now() + FLY_COOLDOWN_MS;

    return FLY_POINTS;
  }, [playableWidth]);

  useEffect(() => {
    if (isPaused) return;

    let animId: number;

    const tick = () => {
      const now = Date.now();
      const currentLogs = logsRef.current;

      if (!targetLogIdRef.current) {
        if (nextSpawnTimeRef.current === 0) {
          nextSpawnTimeRef.current = now + 4000;
        }
        // No fly active: check if cooldown elapsed to spawn a new fly
        if (now >= nextSpawnTimeRef.current) {
          const visibleLogs = currentLogs.filter(
            (l) => l.x > 30 && l.x + l.width < playableWidth - 30
          );

          if (visibleLogs.length > 0) {
            const chosen = visibleLogs[Math.floor(Math.random() * visibleLogs.length)];
            targetLogIdRef.current = chosen.id;
            spawnTimeRef.current = now;
          } else {
            // No log in ideal visible range, retry shortly
            nextSpawnTimeRef.current = now + 1000;
          }
        }
        setFly(null);
      } else {
        // Fly is currently active: track log position and check duration
        const targetLog = currentLogs.find((l) => l.id === targetLogIdRef.current);
        const elapsed = now - spawnTimeRef.current;

        if (
          !targetLog ||
          targetLog.x + targetLog.width < 10 ||
          targetLog.x > playableWidth - 10 ||
          elapsed >= FLY_DURATION_MS
        ) {
          // Despawn fly
          targetLogIdRef.current = null;
          setFly(null);
          nextSpawnTimeRef.current = now + FLY_COOLDOWN_MS;
        } else {
          // Fly stays perched in the center-top of the log
          const flyX = Math.round(targetLog.x + (targetLog.width - FLY_WIDTH) / 2);
          const flyY = Math.round(targetLog.rowY + 2);

          // Blink effect during the last 1.8 seconds of its duration
          const remaining = FLY_DURATION_MS - elapsed;
          const isBlinking = remaining < 1800 ? Math.floor(remaining / 180) % 2 === 0 : false;

          setFly({
            id: `fly-${targetLog.id}`,
            logId: targetLog.id,
            x: flyX,
            y: flyY,
            width: FLY_WIDTH,
            height: FLY_HEIGHT,
            direction: targetLog.direction,
            points: FLY_POINTS,
            isBlinking,
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [playableWidth, isPaused]);

  return {
    fly,
    eatenPopup,
    eatFly,
  };
}
