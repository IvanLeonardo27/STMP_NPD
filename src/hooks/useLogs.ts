import { useEffect, useRef, useState } from 'react';
import { LogEntity } from '@/types/game';

export interface RiverRowDefinition {
  row: number; // 0: bottom, 1: middle, 2: top
  rowY: number; // Y offset inside river zone (height: 165)
  direction: 'left' | 'right';
  speed: number;
  width: number;
  height: number;
  count: number; // Fase 2-3 kayu per gerakan
  minGap: number;
}

export const RIVER_ROW_DEFINITIONS: RiverRowDefinition[] = [
  // Baris 0 (Bawah): 2 kayu lebar sedang - bergerak ke Kanan secara pelan & tenang
  {
    row: 0,
    rowY: 131,
    direction: 'right',
    speed: 0.7,
    width: 120,
    height: 38,
    count: 2,
    minGap: 100,
  },
  // Baris 1 (Tengah): 3 kayu lebih ringkas - bergerak ke Kiri secara santai
  {
    row: 1,
    rowY: 79,
    direction: 'left',
    speed: 0.9,
    width: 90,
    height: 38,
    count: 3,
    minGap: 70,
  },
  // Baris 2 (Atas): 2 kayu panjang - bergerak ke Kanan sangat tenang dekat finish
  {
    row: 2,
    rowY: 20,
    direction: 'right',
    speed: 0.6,
    width: 130,
    height: 38,
    count: 2,
    minGap: 110,
  },
];

function buildInitialLogs(playableWidth: number): LogEntity[] {
  const result: LogEntity[] = [];

  RIVER_ROW_DEFINITIONS.forEach((def) => {
    // Total virtual loop span to distribute logs evenly
    const totalSpan = playableWidth + def.width * 2 + 80;
    const step = totalSpan / def.count;

    for (let i = 0; i < def.count; i++) {
      let initialX: number;

      if (def.direction === 'right') {
        // Moving right: distribute across width
        initialX = -def.width + 20 + i * step;
      } else {
        // Moving left: distribute across width from right to left
        initialX = playableWidth - 20 - def.width - i * step;
      }

      result.push({
        id: `log-row${def.row}-${i}`,
        row: def.row,
        rowY: def.rowY,
        x: initialX,
        width: def.width,
        height: def.height,
        speed: def.speed,
        direction: def.direction,
      });
    }
  });

  return result;
}

export function useLogs(playableWidth: number, isPaused: boolean = false) {
  const [logs, setLogs] = useState<LogEntity[]>(() => buildInitialLogs(playableWidth));

  const logsRef = useRef(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    if (isPaused) return;

    let animId: number;

    const update = () => {
      const currentList = logsRef.current;

      // Group logs by row to maintain safe distance when respawning/wrapping
      const rowGroups = new Map<number, LogEntity[]>();
      currentList.forEach((log) => {
        const arr = rowGroups.get(log.row) ?? [];
        arr.push(log);
        rowGroups.set(log.row, arr);
      });

      const updated = currentList.map((log) => {
        const def = RIVER_ROW_DEFINITIONS[log.row];
        if (!def) return log;

        let nextX = log.x;

        if (def.direction === 'right') {
          nextX += def.speed;

          // Check if log exited to the right
          if (nextX > playableWidth + 30) {
            // Find leftmost log in this row to respawn safely behind it
            const peers = (rowGroups.get(log.row) ?? []).filter((p) => p.id !== log.id);
            const leftmostX =
              peers.length > 0 ? Math.min(...peers.map((p) => p.x)) : -def.width - 20;

            const randomOffset = Math.random() * 30;
            nextX = Math.min(-def.width - 25, leftmostX - def.width - def.minGap - randomOffset);
          }
        } else {
          // def.direction === 'left'
          nextX -= def.speed;

          // Check if log exited to the left
          if (nextX < -def.width - 30) {
            // Find rightmost log in this row to respawn safely behind it
            const peers = (rowGroups.get(log.row) ?? []).filter((p) => p.id !== log.id);
            const rightmostX =
              peers.length > 0 ? Math.max(...peers.map((p) => p.x)) : playableWidth + 20;

            const randomOffset = Math.random() * 30;
            nextX = Math.max(playableWidth + 25, rightmostX + def.width + def.minGap + randomOffset);
          }
        }

        return {
          ...log,
          x: nextX,
        };
      });

      setLogs(updated);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playableWidth, isPaused]);

  return logs;
}
