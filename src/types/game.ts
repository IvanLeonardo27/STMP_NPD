export type Direction = 'up' | 'down' | 'left' | 'right';

export type ControlMode = 'wasd' | 'arrows' | 'swipe';

export type VehicleType = 'car_blue' | 'truck' | 'car_racing';

export interface Position {
  x: number;
  y: number;
}

export interface FrogState {
  x: number;
  y: number;
  lane: number;
  direction: Direction;
  isJumping: boolean;
  status: 'alive' | 'squashed' | 'drowned' | 'burned' | 'eaten';
}

export interface VehicleEntity {
  id: string;
  lane: number; // 0: bottom, 1: middle, 2: top
  laneY: number; // Y offset inside highway zone
  x: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right';
  type: VehicleType;
}

export interface SnakeEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  direction: 'left' | 'right';
}

export interface LogEntity {
  id: string;
  row: number; // 0: bottom, 1: middle, 2: top
  rowY: number; // Y offset inside river zone
  x: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right';
}

export interface FlyBonusEntity {
  id: string;
  logId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'left' | 'right';
  points: number;
  isBlinking: boolean;
}

export interface EatenScorePopup {
  id: number;
  x: number;
  y: number;
  points: number;
}


export interface MovingEntity {
  id: string;
  laneIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right';
  type: 'car_blue' | 'car_racing' | 'truck' | 'wood_log' | 'snake';
}

export type StoneState = 'emerged' | 'sinking' | 'submerged' | 'emerging';

export interface LavaStoneEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  state: StoneState;
  scale: number;
  shakeOffset: number;
}

export interface SteppingStone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameStats {
  score: number;
  timeRemaining: number;
  totalTime: number;
  frogsSaved: number;
  isPaused: boolean;
  isMuted: boolean;
}
