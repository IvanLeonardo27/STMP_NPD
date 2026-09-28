import { useEffect, useRef, useState } from 'react';
import { LavaStoneEntity, StoneState } from '@/types/game';

export interface PitConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number; // 0: bottom, 1: middle, 2: top
}

export const LAVA_PITS: PitConfig[] = [
  // JALUR 1 (Kiri - center X: 74): 3 batu jembatan jalur kiri
  { id: 'bridge-left-0', x: 43, y: 115, width: 62, height: 50, row: 0 },
  { id: 'bridge-left-1', x: 43, y: 63, width: 62, height: 50, row: 1 },
  { id: 'bridge-left-2', x: 43, y: 11, width: 62, height: 50, row: 2 },

  // JALUR 2 (Tengah - center X: 178): 3 batu jembatan jalur tengah
  { id: 'bridge-mid-0', x: 147, y: 115, width: 62, height: 50, row: 0 },
  { id: 'bridge-mid-1', x: 147, y: 63, width: 62, height: 50, row: 1 },
  { id: 'bridge-mid-2', x: 147, y: 11, width: 62, height: 50, row: 2 },

  // JALUR 3 (Kanan - center X: 282): 3 batu jembatan jalur kanan
  { id: 'bridge-right-0', x: 251, y: 115, width: 62, height: 50, row: 0 },
  { id: 'bridge-right-1', x: 251, y: 63, width: 62, height: 50, row: 1 },
  { id: 'bridge-right-2', x: 251, y: 11, width: 62, height: 50, row: 2 },
];

interface StoneInternalState {
  id: string;
  state: StoneState;
  stateTimer: number; // in milliseconds
  scale: number;
  shakeOffset: number;
}

interface UseLavaStonesOptions {
  isPaused?: boolean;
  onStoneSubmerged?: (stoneId: string) => void;
}

export function useLavaStones(options: UseLavaStonesOptions = {}) {
  const { isPaused = false, onStoneSubmerged } = options;

  // Inisialisasi: fasa acak tanpa urutan (5 batu muncul, 4 tenggelam dengan timer bervariasi)
  const internalStatesRef = useRef<StoneInternalState[]>([
    { id: 'bridge-left-0', state: 'emerged', stateTimer: 3400, scale: 1, shakeOffset: 0 },
    { id: 'bridge-left-1', state: 'submerged', stateTimer: 1400, scale: 0, shakeOffset: 0 },
    { id: 'bridge-left-2', state: 'emerged', stateTimer: 4200, scale: 1, shakeOffset: 0 },
    { id: 'bridge-mid-0', state: 'submerged', stateTimer: 2100, scale: 0, shakeOffset: 0 },
    { id: 'bridge-mid-1', state: 'emerged', stateTimer: 4800, scale: 1, shakeOffset: 0 },
    { id: 'bridge-mid-2', state: 'submerged', stateTimer: 1100, scale: 0, shakeOffset: 0 },
    { id: 'bridge-right-0', state: 'emerged', stateTimer: 4600, scale: 1, shakeOffset: 0 },
    { id: 'bridge-right-1', state: 'emerged', stateTimer: 2900, scale: 1, shakeOffset: 0 },
    { id: 'bridge-right-2', state: 'submerged', stateTimer: 1700, scale: 0, shakeOffset: 0 },
  ]);

  const [stones, setStones] = useState<LavaStoneEntity[]>(() =>
    LAVA_PITS.map((pit) => {
      const match = internalStatesRef.current.find((s) => s.id === pit.id);
      return {
        ...pit,
        state: match?.state ?? 'emerged',
        scale: match?.scale ?? 1,
        shakeOffset: match?.shakeOffset ?? 0,
      };
    })
  );

  const lastTimeRef = useRef<number>(Date.now());
  const onStoneSubmergedRef = useRef(onStoneSubmerged);
  onStoneSubmergedRef.current = onStoneSubmerged;

  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    lastTimeRef.current = Date.now();

    const update = () => {
      const now = Date.now();
      const dt = Math.min(now - lastTimeRef.current, 100); // capped delta time in ms
      lastTimeRef.current = now;

      const items = internalStatesRef.current;

      // Count currently emerged / emerging stones
      const activeStones = items.filter(
        (s) => s.state === 'emerged' || s.state === 'sinking' || s.state === 'emerging'
      );
      const activeCount = activeStones.length;

      items.forEach((stone) => {
        stone.stateTimer -= dt;

        switch (stone.state) {
          case 'emerging': {
            // Rising up from lava (lasts 400ms)
            const progress = Math.min(1, 1 - stone.stateTimer / 400);
            stone.scale = Math.max(0, Math.min(1, progress));
            stone.shakeOffset = 0;

            if (stone.stateTimer <= 0) {
              stone.state = 'emerged';
              // Stays emerged for 4.0 - 6.0s (plenty of time to step on)
              stone.stateTimer = 4000 + Math.random() * 2000;
              stone.scale = 1;
            }
            break;
          }

          case 'emerged': {
            stone.scale = 1;
            stone.shakeOffset = 0;

            // When close to sinking (< 1200ms), start warning / tremor
            if (stone.stateTimer <= 1200) {
              stone.state = 'sinking';
            }
            break;
          }

          case 'sinking': {
            // Sinking warning tremor (lasts 1200ms for ample reaction time)
            const warningPhase = 1 - Math.max(0, stone.stateTimer / 1200); // 0 to 1
            // Tremble side-to-side
            stone.shakeOffset = Math.sin(now * 0.03) * (1.2 + warningPhase * 2);
            // Gradually drop slightly
            stone.scale = Math.max(0.7, 1 - warningPhase * 0.3);

            if (stone.stateTimer <= 0) {
              stone.state = 'submerged';
              stone.scale = 0;
              stone.shakeOffset = 0;
              // Stays submerged for 1.5 - 2.5s before being eligible to emerge
              stone.stateTimer = 1500 + Math.random() * 1000;

              // Notify callback that this stone has fully sunk
              onStoneSubmergedRef.current?.(stone.id);
            }
            break;
          }

          case 'submerged': {
            stone.scale = 0;
            stone.shakeOffset = 0;

            if (stone.stateTimer <= 0) {
              // Whack-a-mole balance rule: emerge if active count is < 6 (target 5-6 active stones out of 9)
              if (activeCount < 6) {
                stone.state = 'emerging';
                stone.stateTimer = 400; // 400ms emergence animation
              } else {
                // Wait a little more before emerging
                stone.stateTimer = 500 + Math.random() * 500;
              }
            }
            break;
          }
        }
      });

      // Whack-a-mole safety check: Ensure at least 4 stones are active
      if (activeCount < 4) {
        const submergedCandidates = items.filter((s) => s.state === 'submerged');
        if (submergedCandidates.length > 0) {
          const luckyIdx = Math.floor(Math.random() * submergedCandidates.length);
          submergedCandidates[luckyIdx].state = 'emerging';
          submergedCandidates[luckyIdx].stateTimer = 400;
        }
      }

      // Map to output format
      const output = LAVA_PITS.map((pit) => {
        const s = items.find((item) => item.id === pit.id);
        return {
          ...pit,
          state: s?.state ?? 'submerged',
          scale: s?.scale ?? 0,
          shakeOffset: s?.shakeOffset ?? 0,
        };
      });

      setStones(output);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused]);

  return stones;
}
