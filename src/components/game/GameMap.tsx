import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getPlayerTitleInfo } from '@/utils/playerTitle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Standard max width for board so it looks great on both phone and tablet/web
export const BOARD_WIDTH = Math.min(SCREEN_WIDTH, 420);
export const BORDER_WIDTH = 32;
export const PLAYABLE_WIDTH = BOARD_WIDTH - BORDER_WIDTH * 2;

// Heights of each zone
export const ZONE_HEIGHTS = {
  finish: 85,
  river: 165,
  checkpoint: 52, // Lahan hijau aman / checkpoint sebelum sungai
  lava: 160,
  grass: 90,
  highway: 200,
  start: 100,
  footer: 36,
};

export const TOTAL_BOARD_HEIGHT =
  ZONE_HEIGHTS.finish +
  ZONE_HEIGHTS.river +
  ZONE_HEIGHTS.checkpoint +
  ZONE_HEIGHTS.lava +
  ZONE_HEIGHTS.grass +
  ZONE_HEIGHTS.highway +
  ZONE_HEIGHTS.start;

import {
  ControlMode,
  EatenScorePopup,
  FlyBonusEntity,
  FrogState,
  LavaStoneEntity,
  LogEntity,
  SnakeEntity,
  VehicleEntity,
} from '@/types/game';

interface GameMapProps {
  score?: number;
  timeRemaining?: number;
  totalTime?: number;
  frogsSaved?: number;
  isMuted?: boolean;
  isPaused?: boolean;
  onToggleSound?: () => void;
  onTogglePause?: () => void;
  vehicles?: VehicleEntity[];
  logs?: LogEntity[];
  snake?: SnakeEntity | null;
  lavaStones?: LavaStoneEntity[];
  fly?: FlyBonusEntity | null;
  eatenPopup?: EatenScorePopup | null;
  frog?: FrogState;
  deathReason?: string | null;
  goalBanner?: string | null;
  controlMode?: ControlMode;
  onOpenSettings?: () => void;
  onOpenTutorial?: () => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onRestart?: () => void;
  onOpenHighScores?: () => void;
  onMainMenu?: () => void;
  isNewHighScore?: boolean;
  // Entity positions can be passed dynamically, or fallback to default layout
  entities?: {
    cars?: Array<{ id: string; x: number; lane: number; type: 'blue' | 'racing' | 'truck' }>;
    logs?: Array<{ id: string; x: number; row: number }>;
    snake?: { x: number; direction: 'left' | 'right' };
    frog?: { x: number; y: number; state: 'idle' | 'jump_up' | 'dead' };
  };
}

export default function GameMap({
  score = 0,
  timeRemaining = 120,
  totalTime = 120,
  frogsSaved = 0,
  isMuted = false,
  isPaused = false,
  onToggleSound,
  onTogglePause,
  vehicles,
  logs,
  snake,
  lavaStones,
  fly,
  eatenPopup,
  frog,
  deathReason,
  goalBanner,
  controlMode = 'arrows',
  onOpenSettings,
  onOpenTutorial,
  onSwipe,
  onRestart,
  onOpenHighScores,
  onMainMenu,
  isNewHighScore = false,
  entities,
}: GameMapProps) {
  const timeProgress = Math.max(0, Math.min(1, timeRemaining / totalTime));
  const titleInfo = getPlayerTitleInfo(frogsSaved);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => controlMode === 'swipe',
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (controlMode !== 'swipe') return false;
          return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (controlMode !== 'swipe') return;
          const { dx, dy } = gestureState;
          const minSwipe = 15;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > minSwipe) onSwipe?.('right');
            else if (dx < -minSwipe) onSwipe?.('left');
          } else {
            if (dy > minSwipe) onSwipe?.('down');
            else if (dy < -minSwipe) onSwipe?.('up');
          }
        },
      }),
    [controlMode, onSwipe]
  );

  return (
    <View style={styles.outerContainer}>
      {/* 1. TOP HUD / HEADER */}
      <View style={[styles.hudContainer, { width: BOARD_WIDTH }]}>
        {/* Score Panel */}
        <View style={styles.scoreContainer}>
          <Image
            source={require('@/assets/images/ui/score_panel.png')}
            style={styles.scorePanelImg}
            resizeMode="contain"
          />
          <Text style={styles.scoreText}>
            {score.toString().padStart(4, '0')}
          </Text>
        </View>

        {/* Time Progress Bar */}
        <View style={styles.timeContainer}>
          <View style={styles.timeHeaderRow}>
            <Text style={styles.timeLabel}>TIME</Text>
            <Text
              style={[
                styles.timeSecondsText,
                timeProgress <= 0.2 && styles.timeSecondsTextUrgent,
              ]}
            >
              {Math.ceil(timeRemaining)}s
            </Text>
          </View>
          <View style={styles.timeBarTrack}>
            <View
              style={[
                styles.timeBarFill,
                {
                  width: `${timeProgress * 100}%`,
                  backgroundColor:
                    timeProgress > 0.4
                      ? '#52c41a'
                      : timeProgress > 0.18
                      ? '#faad14'
                      : '#ff4d4f',
                },
              ]}
            />
          </View>
        </View>


        {/* Sound & Pause Buttons */}
        <View style={styles.hudActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleSound}
            style={styles.hudButton}
          >
            <Image
              source={
                isMuted
                  ? require('@/assets/images/ui/btn_sound_mute.png')
                  : require('@/assets/images/ui/btn_sound_on.png')
              }
              style={styles.hudIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onTogglePause}
            style={styles.hudButton}
          >
            <Image
              source={
                isPaused
                  ? require('@/assets/images/ui/btn_play.png')
                  : require('@/assets/images/ui/btn_pause.png')
              }
              style={styles.hudIcon}
            />
          </TouchableOpacity>

          {/* Tutorial Button */}
          {onOpenTutorial && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onOpenTutorial}
              style={styles.hudButton}
            >
              <Text style={{ fontSize: 17 }}>📖</Text>
            </TouchableOpacity>
          )}

          {/* Settings Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenSettings}
            style={styles.hudButton}
          >
            <Text style={{ fontSize: 17 }}>⚙️</Text>
          </TouchableOpacity>

          {/* High Scores Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenHighScores}
            style={styles.hudButton}
          >
            <Text style={{ fontSize: 17 }}>🏆</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. PLAYABLE BOARD (Framed by Left and Right Wood Borders) */}
      <View style={[styles.boardWrapper, { width: BOARD_WIDTH }]} {...panResponder.panHandlers}>
        {/* Left Wood Border */}
        <Image
          source={require('@/assets/images/map/border_wood_vertical.png')}
          style={[styles.woodBorder, styles.leftBorder]}
          resizeMode="repeat"
        />

        {/* Right Wood Border */}
        <Image
          source={require('@/assets/images/map/border_wood_vertical.png')}
          style={[styles.woodBorder, styles.rightBorder]}
          resizeMode="repeat"
        />

        {/* CENTER PLAYABLE AREA */}
        <View style={[styles.playableArea, { width: PLAYABLE_WIDTH }]}>
          {/* ZONE 1: FINISH GOAL AREA */}
          <View style={[styles.zone, { height: ZONE_HEIGHTS.finish }]}>
            <Image
              source={require('@/assets/images/map/goal_finish_area.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />
          </View>

          {/* ZONE 2: RIVER ZONE */}
          <View style={[styles.zone, styles.riverZone, { height: ZONE_HEIGHTS.river }]}>
            {/* Blue water background */}
            <View style={styles.riverWater}>
              {/* Optional wave lines pattern */}
              <View style={styles.waveLine1} />
              <View style={styles.waveLine2} />
              <View style={styles.waveLine3} />
            </View>

            {/* Wood Logs: Dynamic Moving Logs or Static Fallback */}
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <Image
                  key={log.id}
                  source={require('@/assets/images/river/wood_log.png')}
                  style={{
                    position: 'absolute',
                    left: log.x,
                    top: log.rowY,
                    width: log.width,
                    height: log.height,
                    zIndex: 5,
                  }}
                  resizeMode="contain"
                />
              ))
            ) : (
              <>
                {/* Fallback Static Row 1: Logs (Top River Row) */}
                <View style={[styles.riverRow, { top: 12 }]}>
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[0]?.x ?? 20 }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[1]?.x ?? 190 }]}
                    resizeMode="contain"
                  />
                </View>

                {/* Fallback Static Row 2: Logs (Middle River Row) */}
                <View style={[styles.riverRow, { top: 62 }]}>
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[2]?.x ?? 80 }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[3]?.x ?? 240 }]}
                    resizeMode="contain"
                  />
                </View>

                {/* Fallback Static Row 3: Logs (Bottom River Row) */}
                <View style={[styles.riverRow, { top: 112 }]}>
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[4]?.x ?? 15 }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('@/assets/images/river/wood_log.png')}
                    style={[styles.logItem, { left: entities?.logs?.[5]?.x ?? 185 }]}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}

            {/* Bonus Fly perched on moving wood log */}
            {fly && (
              <Image
                source={
                  fly.direction === 'right'
                    ? require('@/assets/images/river/fly_right.png')
                    : require('@/assets/images/river/fly_left.png')
                }
                style={{
                  position: 'absolute',
                  left: fly.x,
                  top: fly.y,
                  width: fly.width,
                  height: fly.height,
                  zIndex: 12,
                  opacity: fly.isBlinking ? 0.3 : 1,
                }}
                resizeMode="contain"
              />
            )}

            {/* Floating Eaten Score Popup */}
            {eatenPopup && (
              <View
                style={{
                  position: 'absolute',
                  left: Math.max(8, eatenPopup.x - 10),
                  top: eatenPopup.y - 16,
                  zIndex: 25,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: '#ffd700',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#ffd700',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    color: '#ffd700',
                    fontSize: 13,
                    fontWeight: 'bold',
                    letterSpacing: 0.5,
                  }}
                >
                  +{eatenPopup.points}
                </Text>
              </View>
            )}
          </View>

          {/* ZONE 2.5: SAFE GRASS (BETWEEN LAVA & RIVER) */}
          <View style={[styles.zone, styles.checkpointZone, { height: ZONE_HEIGHTS.checkpoint }]}>
            <Image
              source={require('@/assets/images/map/middle_grass.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />
          </View>

          {/* ZONE 3: LAVA & STEPPING STONES ZONE */}
          <View style={[styles.zone, { height: ZONE_HEIGHTS.lava }]}>
            <Image
              source={require('@/assets/images/map/lava_background.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />
            {/* Stepping Stones in Lava (Whack-a-Mole emergence/submergence) */}
            {lavaStones && lavaStones.length > 0 ? (
              lavaStones.map((stone) => {
                if (stone.scale <= 0.05) return null;

                return (
                  <Image
                    key={stone.id}
                    source={require('@/assets/images/hazards/stepping_stone.png')}
                    style={[
                      styles.stoneItem,
                      {
                        left: stone.x + stone.shakeOffset,
                        top: stone.y,
                        width: stone.width,
                        height: stone.height,
                        transform: [{ scale: stone.scale }],
                        opacity: stone.state === 'sinking' ? 0.88 : 1,
                        zIndex: 5,
                      },
                    ]}
                    resizeMode="contain"
                  />
                );
              })
            ) : (
              <>
                {/* Fallback Static Stones */}
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 5, left: 14, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 15, left: 236, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 40, left: 122, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 92, left: 52, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 100, left: 196, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/assets/images/hazards/stepping_stone.png')}
                  style={[styles.stoneItem, { top: 73, left: 280, width: 70, height: 50 }]}
                  resizeMode="contain"
                />
              </>
            )}
          </View>

          {/* ZONE 4: MIDDLE SAFE GRASS (WITH PATROLLING SNAKE) */}
          <View style={[styles.zone, { height: ZONE_HEIGHTS.grass }]}>
            <Image
              source={require('@/assets/images/map/middle_grass.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />
            {/* Dynamic Patrolling Snake */}
            {snake !== undefined ? (
              snake ? (
                <Image
                  source={
                    frog?.status === 'eaten'
                      ? require('@/assets/images/hazards/snake_eat_frog.png')
                      : require('@/assets/images/hazards/snake.png')
                  }
                  style={[
                    styles.snakeItem,
                    {
                      top: snake.y,
                      left: snake.x,
                      transform: [{ scaleX: snake.direction === 'left' ? -1 : 1 }],
                      zIndex: 6,
                    },
                  ]}
                  resizeMode="contain"
                />
              ) : null
            ) : (
              <>
                {/* Fallback Static Snake */}
                <Image
                  source={require('@/assets/images/hazards/snake.png')}
                  style={[
                    styles.snakeItem,
                    {
                      top: 15,
                      left: entities?.snake?.x ?? 20,
                      transform: [{ scaleX: entities?.snake?.direction === 'left' ? -1 : 1 }],
                    },
                  ]}
                  resizeMode="contain"
                />
              </>
            )}
          </View>

          {/* ZONE 5: 3-LANE HIGHWAY ROAD */}
          <View style={[styles.zone, { height: ZONE_HEIGHTS.highway }]}>
            <Image
              source={require('@/assets/images/map/road_highway_4lanes.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />

            {/* Dynamic Moving Vehicles */}
            {vehicles && vehicles.length > 0 ? (
              vehicles.map((v) => {
                const isTruck = v.type === 'truck';
                const isRacing = v.type === 'car_racing';
                const source = isTruck
                  ? require('@/assets/images/vehicles/truck.png')
                  : isRacing
                  ? require('@/assets/images/vehicles/car_racing.png')
                  : require('@/assets/images/vehicles/car_blue.png');

                return (
                  <Image
                    key={v.id}
                    source={source}
                    style={{
                      position: 'absolute',
                      left: v.x,
                      top: v.laneY,
                      width: v.width,
                      height: v.height,
                      transform: [{ scaleX: v.direction === 'left' ? -1 : 1 }],
                      zIndex: 5,
                    }}
                    resizeMode="contain"
                  />
                );
              })
            ) : (
              <>
                {/* Static Fallback Lane 3 (Top): Blue Cars */}
                <View style={[styles.roadLane, { top: 14 }]}>
                  <Image
                    source={require('@/assets/images/vehicles/car_blue.png')}
                    style={[styles.carBlue, { left: 35 }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('@/assets/images/vehicles/car_blue.png')}
                    style={[styles.carBlue, { left: 220 }]}
                    resizeMode="contain"
                  />
                </View>

                {/* Static Fallback Lane 2 (Middle): Red Long Truck */}
                <View style={[styles.roadLane, { top: 78 }]}>
                  <Image
                    source={require('@/assets/images/vehicles/truck.png')}
                    style={[
                      styles.truck,
                      { left: 70, transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                {/* Static Fallback Lane 1 (Bottom): Racing Cars */}
                <View style={[styles.roadLane, { top: 144 }]}>
                  <Image
                    source={require('@/assets/images/vehicles/car_racing.png')}
                    style={[styles.carRacing, { left: 30 }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('@/assets/images/vehicles/car_racing.png')}
                    style={[styles.carRacing, { left: 235 }]}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}
          </View>

          {/* ZONE 6: START SIDEWALK & FROG SPAWN */}
          <View style={[styles.zone, { height: ZONE_HEIGHTS.start }]}>
            <Image
              source={require('@/assets/images/map/start_sidewalk.png')}
              style={styles.fullBackground}
              resizeMode="cover"
            />
          </View>

          {/* THE FROG (ABSOLUTE OVER THE ENTIRE PLAYABLE ARENA) */}
          {frog ? (
            frog.status === 'eaten' ? null : (
              <View
                style={[
                  styles.frogContainer,
                  {
                    left: frog.x,
                    top: frog.y,
                    zIndex: 40,
                  },
                ]}
              >
                <Image
                  source={
                    frog.status === 'squashed'
                      ? require('@/assets/images/frog/frog_dead_squash.png')
                      : frog.status === 'burned'
                      ? require('@/assets/images/frog/frog_dead_burned.png')
                      : frog.status === 'drowned'
                      ? require('@/assets/images/frog/frog_dead_drown.png')
                      : frog.isJumping
                      ? frog.direction === 'up'
                        ? require('@/assets/images/frog/frog_jump_up.png')
                        : frog.direction === 'down'
                        ? require('@/assets/images/frog/frog_jump_down.png')
                        : frog.direction === 'left'
                        ? require('@/assets/images/frog/frog_jump_left.png')
                        : require('@/assets/images/frog/frog_jump_right.png')
                      : require('@/assets/images/frog/frog_idle.png')
                  }
                  style={
                    frog.status === 'squashed'
                      ? { width: 56, height: 32 }
                      : styles.frogImg
                  }
                  resizeMode="contain"
                />
              </View>
            )
          ) : (
            <View
              style={[
                styles.frogContainer,
                {
                  left: entities?.frog?.x ?? PLAYABLE_WIDTH / 2 - 25,
                  top: entities?.frog?.y ?? 730,
                  zIndex: 40,
                },
              ]}
            >
              <Image
                source={require('@/assets/images/frog/frog_idle.png')}
                style={styles.frogImg}
                resizeMode="contain"
              />
            </View>
          )}

          {/* TIME UP OR DEATH / FAILURE OVERLAY BANNER */}
          {timeRemaining <= 0 ? (
            <View style={styles.deathBannerWrapper}>
              <View style={[styles.deathBannerBox, styles.timeUpBannerBox]}>
                <Text style={styles.deathBannerText}>⏰ WAKTU HABIS!</Text>
                <Text style={styles.timeUpScoreText}>Skor Akhir: {score}</Text>

                {isNewHighScore ? (
                  <View style={styles.newHighScoreBadge}>
                    <Text style={styles.newHighScoreText}>🎉 REKOR TERTINGGI BARU!</Text>
                  </View>
                ) : null}

                {/* Gelar Pemain Sesuai Jumlah Katak Terselamatkan */}
                <View style={styles.titleBadgeContainer}>
                  <Text style={styles.titleLabel}>GELAR DIPEROLEH</Text>
                  <View style={[styles.titleBadgePill, { borderColor: titleInfo.color }]}>
                    <Text style={styles.titleBadgeIcon}>{titleInfo.badge}</Text>
                    <Text style={[styles.titleBadgeName, { color: titleInfo.color }]}>
                      {titleInfo.title}
                    </Text>
                  </View>
                  <Text style={styles.titleBadgeDesc}>{titleInfo.description}</Text>
                  <Text style={styles.frogsCountNote}>
                    🐸 {frogsSaved} Katak Berhasil Menyeberang
                  </Text>
                </View>

                {/* 3 Tombol Aksi Sesuai Ketentuan */}
                <View style={styles.bannerActionsContainer}>
                  {onRestart ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={onRestart}
                      style={styles.bannerPlayAgainBtn}
                    >
                      <Text style={styles.bannerPlayAgainText}>🔁 Play Again</Text>
                    </TouchableOpacity>
                  ) : null}

                  {onOpenHighScores ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={onOpenHighScores}
                      style={styles.bannerHighScoresBtn}
                    >
                      <Text style={styles.bannerHighScoresText}>🏆 High Scores</Text>
                    </TouchableOpacity>
                  ) : null}

                  {onMainMenu ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={onMainMenu}
                      style={styles.bannerMainMenuBtn}
                    >
                      <Text style={styles.bannerMainMenuText}>🏠 Main Menu</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          ) : goalBanner ? (
            <View style={styles.deathBannerWrapper}>
              <View style={[styles.deathBannerBox, styles.goalBannerBox]}>
                <Text style={styles.goalBannerText}>{goalBanner}</Text>
              </View>
            </View>
          ) : deathReason ? (
            <View style={styles.deathBannerWrapper}>
              <View
                style={[
                  styles.deathBannerBox,
                  frog?.status === 'squashed' && styles.deathBannerSquashed,
                  frog?.status === 'eaten' && styles.deathBannerEaten,
                  frog?.status === 'burned' && styles.deathBannerBurned,
                  frog?.status === 'drowned' && styles.deathBannerDrowned,
                ]}
              >
                <Text style={styles.deathBannerText}>{deathReason}</Text>
              </View>
            </View>
          ) : null}


        </View>
      </View>

      {/* 3. BOTTOM FOOTER BAR (Frog Progress / Slots) */}
      <View style={[styles.footerContainer, { width: BOARD_WIDTH }]}>
        <Image
          source={require('@/assets/images/map/bottom_footer_bar.png')}
          style={styles.footerBackground}
          resizeMode="cover"
        />
        {/* Frog Saved Slot Dots */}
        <View style={styles.slotsRow}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.slotDot,
                frogsSaved > index && styles.slotDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    backgroundColor: '#1b1e22',
  },
  // HUD
  hudContainer: {
    height: 52,
    backgroundColor: '#26292d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1c1e',
  },
  scoreContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  scorePanelImg: {
    width: 105,
    height: 34,
  },
  scoreText: {
    position: 'absolute',
    left: 36,
    right: 8,
    textAlign: 'center',
    color: '#f1f3f4',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  timeContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  timeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  timeLabel: {
    color: '#a3d977',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  timeSecondsText: {
    color: '#9ba0a6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeSecondsTextUrgent: {
    color: '#ff4d4f',
    fontWeight: '900',
  },
  timeBarTrack: {
    width: '100%',
    height: 14,
    backgroundColor: '#181b1e',
    borderRadius: 7,
    padding: 2,
    borderWidth: 1,
    borderColor: '#373a3e',
  },
  timeBarFill: {
    height: '100%',
    backgroundColor: '#52c41a',
    borderRadius: 5,
  },
  hudActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  hudButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudIcon: {
    width: 28,
    height: 28,
  },

  // BOARD
  boardWrapper: {
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  woodBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: BORDER_WIDTH,
    zIndex: 10,
  },
  leftBorder: {
    left: 0,
  },
  rightBorder: {
    right: 0,
  },
  playableArea: {
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  zone: {
    width: '100%',
    position: 'relative',
  },
  fullBackground: {
    width: '100%',
    height: '100%',
  },

  // RIVER
  riverZone: {
    backgroundColor: '#4bb8ec',
    overflow: 'hidden',
  },
  riverWater: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#51bef2',
  },
  waveLine1: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  waveLine2: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  waveLine3: {
    position: 'absolute',
    top: 135,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  riverRow: {
    position: 'absolute',
    width: '100%',
    height: 38,
  },
  logItem: {
    position: 'absolute',
    width: 130,
    height: 38,
  },

  // STONES
  stoneItem: {
    position: 'absolute',
    width: 62,
    height: 50,
  },

  // SNAKE
  snakeItem: {
    position: 'absolute',
    width: 120,
    height: 32,
  },

  // ROAD & VEHICLES
  roadLane: {
    position: 'absolute',
    width: '100%',
    height: 40,
  },
  carBlue: {
    position: 'absolute',
    width: 78,
    height: 38,
  },
  truck: {
    position: 'absolute',
    width: 140,
    height: 40,
  },
  carRacing: {
    position: 'absolute',
    width: 82,
    height: 38,
  },

  // FROG
  frogContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frogImg: {
    width: 50,
    height: 50,
  },

  // FOOTER
  footerContainer: {
    height: ZONE_HEIGHTS.footer,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBackground: {
    width: '100%',
    height: '100%',
  },
  slotsRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%',
    bottom: 4,
  },
  slotDot: {
    width: 10,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#408b30',
  },
  slotDotActive: {
    backgroundColor: '#72e047',
    shadowColor: '#72e047',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // DEATH BANNER
  deathBannerWrapper: {
    position: 'absolute',
    top: '40%',
    left: 10,
    right: 10,
    alignItems: 'center',
    zIndex: 100,
  },
  deathBannerBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffdd00',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  deathBannerSquashed: {
    borderColor: '#ff3b30',
    backgroundColor: 'rgba(180, 20, 20, 0.92)',
  },
  deathBannerEaten: {
    borderColor: '#30d158',
    backgroundColor: 'rgba(20, 90, 30, 0.92)',
  },
  deathBannerBurned: {
    borderColor: '#ff9500',
    backgroundColor: 'rgba(190, 50, 10, 0.92)',
  },
  deathBannerDrowned: {
    borderColor: '#0a84ff',
    backgroundColor: 'rgba(10, 60, 140, 0.92)',
  },
  deathBannerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  timeUpBannerBox: {
    borderColor: '#ff4d4f',
    backgroundColor: 'rgba(50, 10, 10, 0.94)',
    alignItems: 'center',
  },
  timeUpScoreText: {
    color: '#ffd700',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  newHighScoreBadge: {
    backgroundColor: '#ffd700',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  newHighScoreText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleBadgeContainer: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444c56',
    width: '100%',
  },
  titleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8b949e',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  titleBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  titleBadgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  titleBadgeName: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  titleBadgeDesc: {
    color: '#c9d1d9',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  frogsCountNote: {
    color: '#7ee787',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  bannerActionsContainer: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  bannerPlayAgainBtn: {
    backgroundColor: '#238636',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ea043',
    alignItems: 'center',
    shadowColor: '#238636',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerPlayAgainText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerHighScoresBtn: {
    backgroundColor: '#1b1f24',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  bannerHighScoresText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerMainMenuBtn: {
    backgroundColor: '#21262d',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
  },
  bannerMainMenuText: {
    color: '#c9d1d9',
    fontSize: 12,
    fontWeight: '700',
  },
  goalBannerBox: {
    borderColor: '#72e047',
    backgroundColor: 'rgba(20, 80, 20, 0.94)',
    alignItems: 'center',
    shadowColor: '#72e047',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  goalBannerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // SAFE GRASS ZONE (BETWEEN LAVA & RIVER)
  checkpointZone: {
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderTopColor: '#2b581e',
    borderBottomColor: '#2b581e',
    overflow: 'hidden',
  },
});

