import { useEffect, useRef, useState } from 'react';
import { VehicleEntity, VehicleType } from '@/types/game';

// Lane Y positions inside highway zone (from bottom to top)
// Index 0: Bottom lane (closest to start sidewalk)
// Index 1: Middle lane
// Index 2: Top lane (closest to safe grass)
export const LANE_Y_POSITIONS = [144, 78, 14];

export interface LaneDefinition {
  lane: number;
  laneY: number;
  type: VehicleType;
  direction: 'left' | 'right';
  speed: number;
  width: number;
  height: number;
  count: number;
  minGap: number;
}

export const LANE_DEFINITIONS: LaneDefinition[] = [
  // Lajur 0 (Bawah): Mobil sedan biru - santai & pelan, arah ke kiri
  {
    lane: 0,
    laneY: 144,
    type: 'car_blue',
    direction: 'left',
    speed: 0.7,
    width: 76,
    height: 36,
    count: 2,
    minGap: 240,
  },
  // Lajur 1 (Tengah): Truk kontainer - panjang & sangat pelan, arah ke kanan
  {
    lane: 1,
    laneY: 78,
    type: 'truck',
    direction: 'right',
    speed: 0.48,
    width: 135,
    height: 38,
    count: 2,
    minGap: 260,
  },
  // Lajur 2 (Atas): Mobil balap kuning - terkendali & tenang, arah ke kiri
  {
    lane: 2,
    laneY: 14,
    type: 'car_racing',
    direction: 'left',
    speed: 0.85,
    width: 82,
    height: 36,
    count: 2,
    minGap: 250,
  },
];


function buildInitialVehicles(playableWidth: number): VehicleEntity[] {
  const result: VehicleEntity[] = [];

  LANE_DEFINITIONS.forEach((def) => {
    // Total loop span for spacing calculation with generous gaps
    const totalSpan = playableWidth + def.width * 2 + def.minGap;
    const step = totalSpan / def.count;

    for (let i = 0; i < def.count; i++) {
      let initialX: number;

      if (def.direction === 'left') {
        // First vehicle is visible on screen, second vehicle starts off-screen to the right
        initialX = 40 + i * step;
      } else {
        // First vehicle is visible on screen, second vehicle starts off-screen to the left
        initialX = playableWidth - 40 - def.width - i * step;
      }

      result.push({
        id: `vehicle-lane${def.lane}-${i}`,
        lane: def.lane,
        laneY: def.laneY,
        x: initialX,
        width: def.width,
        height: def.height,
        speed: def.speed,
        direction: def.direction,
        type: def.type,
      });
    }
  });

  return result;
}

export function useVehicles(playableWidth: number, isPaused: boolean = false) {
  const [vehicles, setVehicles] = useState<VehicleEntity[]>(() =>
    buildInitialVehicles(playableWidth)
  );

  const vehiclesRef = useRef(vehicles);
  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    if (isPaused) return;

    let animId: number;

    const update = () => {
      const currentList = vehiclesRef.current;

      // Group vehicles by lane to calculate proper respawn distance
      const laneGroups = new Map<number, VehicleEntity[]>();
      currentList.forEach((v) => {
        const arr = laneGroups.get(v.lane) ?? [];
        arr.push(v);
        laneGroups.set(v.lane, arr);
      });

      const updated = currentList.map((v) => {
        const def = LANE_DEFINITIONS[v.lane];
        if (!def) return v;

        let nextX = v.x;

        if (def.direction === 'right') {
          nextX += def.speed;

          // Check if vehicle has completely exited to the right
          if (nextX > playableWidth + 40) {
            // Find the leftmost vehicle in this lane to respawn behind it safely
            const lanePeers = (laneGroups.get(v.lane) ?? []).filter((p) => p.id !== v.id);
            const leftmostX =
              lanePeers.length > 0
                ? Math.min(...lanePeers.map((p) => p.x))
                : -def.width - 80;

            const randomOffset = Math.random() * 60;
            // Respawn on the left, far off-screen and behind the other vehicle by minGap
            nextX = Math.min(-def.width - 80, leftmostX - def.width - def.minGap - randomOffset);
          }
        } else {
          // def.direction === 'left'
          nextX -= def.speed;

          // Check if vehicle has completely exited to the left
          if (nextX < -def.width - 40) {
            // Find the rightmost vehicle in this lane to respawn behind it safely
            const lanePeers = (laneGroups.get(v.lane) ?? []).filter((p) => p.id !== v.id);
            const rightmostX =
              lanePeers.length > 0
                ? Math.max(...lanePeers.map((p) => p.x))
                : playableWidth + 80;

            const randomOffset = Math.random() * 60;
            // Respawn on the right, far off-screen and behind the other vehicle by minGap
            nextX = Math.max(playableWidth + 80, rightmostX + def.width + def.minGap + randomOffset);
          }
        }

        return {
          ...v,
          x: nextX,
        };
      });

      setVehicles(updated);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playableWidth, isPaused]);

  return vehicles;
}
