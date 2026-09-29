import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ControlMode } from '@/types/game';

interface TutorialModalProps {
  visible: boolean;
  controlMode: ControlMode;
  onStartGame: (dontShowAgain: boolean) => void;
  onClose?: () => void;
}

export default function TutorialModal({
  visible,
  controlMode,
  onStartGame,
  onClose,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onStartGame(dontShowAgain);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStartImmediately = () => {
    onStartGame(dontShowAgain);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleStartImmediately}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>📖</Text>
              <Text style={styles.headerTitle}>PANDUAN BERMAIN</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleStartImmediately}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Step Indicator Tabs */}
          <View style={styles.stepTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCurrentStep(1)}
              style={[styles.stepTab, currentStep === 1 && styles.stepTabActive]}
            >
              <Text
                style={[
                  styles.stepTabText,
                  currentStep === 1 && styles.stepTabTextActive,
                ]}
              >
                1. Kontrol & Misi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCurrentStep(2)}
              style={[styles.stepTab, currentStep === 2 && styles.stepTabActive]}
            >
              <Text
                style={[
                  styles.stepTabText,
                  currentStep === 2 && styles.stepTabTextActive,
                ]}
              >
                2. Rintangan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCurrentStep(3)}
              style={[styles.stepTab, currentStep === 3 && styles.stepTabActive]}
            >
              <Text
                style={[
                  styles.stepTabText,
                  currentStep === 3 && styles.stepTabTextActive,
                ]}
              >
                3. Bonus & Tips
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.highlightBox}>
                  <Text style={styles.highlightTitle}>🎯 Misi Utama</Text>
                  <Text style={styles.highlightDesc}>
                    Seberangkan katak dari trotoar bawah melintasi semua rintangan menuju ke{' '}
                    <Text style={styles.boldText}>Safe Zone (Sarang Bunga)</Text> di paling atas sebelum waktu 120 detik habis!
                  </Text>
                </View>

                <Text style={styles.sectionHeader}>🕹️ Kontrol Aktif Saat Ini</Text>

                <View style={styles.controlCard}>
                  {controlMode === 'wasd' && (
                    <>
                      <Text style={styles.controlModeBadge}>Mode: Keyboard WASD</Text>
                      <View style={styles.keyGrid}>
                        <View style={styles.keyBox}>
                          <Text style={styles.keyChar}>W</Text>
                          <Text style={styles.keyLabel}>Atas</Text>
                        </View>
                        <View style={styles.keyRow}>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>A</Text>
                            <Text style={styles.keyLabel}>Kiri</Text>
                          </View>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>S</Text>
                            <Text style={styles.keyLabel}>Bawah</Text>
                          </View>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>D</Text>
                            <Text style={styles.keyLabel}>Kanan</Text>
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {controlMode === 'arrows' && (
                    <>
                      <Text style={styles.controlModeBadge}>Mode: Tombol Panah (Arrow Keys)</Text>
                      <View style={styles.keyGrid}>
                        <View style={styles.keyBox}>
                          <Text style={styles.keyChar}>⬆️</Text>
                          <Text style={styles.keyLabel}>Atas</Text>
                        </View>
                        <View style={styles.keyRow}>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>⬅️</Text>
                            <Text style={styles.keyLabel}>Kiri</Text>
                          </View>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>⬇️</Text>
                            <Text style={styles.keyLabel}>Bawah</Text>
                          </View>
                          <View style={styles.keyBox}>
                            <Text style={styles.keyChar}>➡️</Text>
                            <Text style={styles.keyLabel}>Kanan</Text>
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {controlMode === 'swipe' && (
                    <>
                      <Text style={styles.controlModeBadge}>Mode: Swipe Mouse / Layar</Text>
                      <Text style={styles.swipeTip}>
                        👆 Usap layar HP atau klik & geser kursor mouse ke arah atas, bawah, kiri, atau kanan untuk membuat katak meloncat!
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>⚠️ 4 Zona Bahaya yang Harus Dilewati</Text>

                <View style={styles.hazardRow}>
                  <View style={styles.hazardBadgeRed}>
                    <Text style={styles.hazardIcon}>🚗</Text>
                  </View>
                  <View style={styles.hazardInfo}>
                    <Text style={styles.hazardTitle}>1. Jalan Raya (Highway)</Text>
                    <Text style={styles.hazardDesc}>
                      Waspadai mobil sedan biru, truk trailer besar, dan mobil balap super kencang. Jangan sampai tertabrak!
                    </Text>
                  </View>
                </View>

                <View style={styles.hazardRow}>
                  <View style={styles.hazardBadgeOrange}>
                    <Text style={styles.hazardIcon}>🐍</Text>
                  </View>
                  <View style={styles.hazardInfo}>
                    <Text style={styles.hazardTitle}>2. Rumput Tengah (Middle Grass)</Text>
                    <Text style={styles.hazardDesc}>
                      Area jeda sebelum lava. Hati-hati dengan ular berbisa yang berpatroli mondar-mandir!
                    </Text>
                  </View>
                </View>

                <View style={styles.hazardRow}>
                  <View style={styles.hazardBadgeFlame}>
                    <Text style={styles.hazardIcon}>🌋</Text>
                  </View>
                  <View style={styles.hazardInfo}>
                    <Text style={styles.hazardTitle}>3. Arena Lava & Batu Apung</Text>
                    <Text style={styles.hazardDesc}>
                      Lompat hanya di atas batu pijakan. Batu bisa bergetar dan tenggelam sewaktu-waktu ke dalam lahar!
                    </Text>
                  </View>
                </View>

                <View style={styles.hazardRow}>
                  <View style={styles.hazardBadgeBlue}>
                    <Text style={styles.hazardIcon}>🪵</Text>
                  </View>
                  <View style={styles.hazardInfo}>
                    <Text style={styles.hazardTitle}>4. Sungai & Batang Kayu</Text>
                    <Text style={styles.hazardDesc}>
                      Pijak batang kayu yang terapung. Jangan jatuh ke air dan jangan terbawa sampai membentur tembok tepi!
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>⭐ Tips Mendapatkan Skor Tertinggi</Text>

                <View style={styles.tipCard}>
                  <View style={styles.tipHeaderRow}>
                    <Text style={styles.tipIcon}>🪰</Text>
                    <Text style={styles.tipTitle}>Tangkap Lalat Bonus</Text>
                  </View>
                  <Text style={styles.tipDesc}>
                    Lalat akan muncul dan berkedip secara acak di atas kayu sungai. Makan lalat untuk mendapatkan skor bonus melimpah!
                  </Text>
                </View>

                <View style={styles.tipCard}>
                  <View style={styles.tipHeaderRow}>
                    <Text style={styles.tipIcon}>⏱️</Text>
                    <Text style={styles.tipTitle}>Waktu 120 Detik</Text>
                  </View>
                  <Text style={styles.tipDesc}>
                    Game berjalan selama 2 menit. Katak memiliki respawn tak terbatas, jadi seberangkan katak sebanyak-banyaknya!
                  </Text>
                </View>

                <View style={styles.tipCard}>
                  <View style={styles.tipHeaderRow}>
                    <Text style={styles.tipIcon}>🏆</Text>
                    <Text style={styles.tipTitle}>Gelar Pemain & Papan Skor</Text>
                  </View>
                  <Text style={styles.tipDesc}>
                    Capai gelar tertinggi seperti <Text style={styles.boldGreen}>Apex Amphibian</Text> dan pecahkan rekor High Score!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Don't show again checkbox */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDontShowAgain((prev) => !prev)}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxActive]}>
              {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Jangan tampilkan panduan ini lagi secara otomatis
            </Text>
          </TouchableOpacity>

          {/* Bottom Actions */}
          <View style={styles.actionRow}>
            {currentStep > 1 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePrev}
                style={styles.prevBtn}
              >
                <Text style={styles.prevBtnText}>← Kembali</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleStartImmediately}
                style={styles.skipBtn}
              >
                <Text style={styles.skipBtnText}>Lewati</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={styles.nextBtn}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === 3 ? 'MULAI BERMAIN! 🚀' : 'Lanjut →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#1b1f24',
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#30363d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '800',
  },
  stepTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#262c36',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d4450',
  },
  stepTabActive: {
    backgroundColor: '#238636',
    borderColor: '#3fb950',
  },
  stepTabText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '700',
  },
  stepTabTextActive: {
    color: '#ffffff',
  },
  contentScroll: {
    maxHeight: 330,
    marginBottom: 14,
  },
  stepContent: {
    paddingVertical: 4,
    gap: 12,
  },
  highlightBox: {
    backgroundColor: '#182f24',
    borderWidth: 1.5,
    borderColor: '#2ea043',
    borderRadius: 12,
    padding: 12,
  },
  highlightTitle: {
    color: '#3fb950',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  highlightDesc: {
    color: '#c9d1d9',
    fontSize: 12.5,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#ffd700',
  },
  boldGreen: {
    fontWeight: '800',
    color: '#3fb950',
  },
  sectionHeader: {
    color: '#f0f6fc',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  controlCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
  },
  controlModeBadge: {
    color: '#58a6ff',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },
  keyGrid: {
    alignItems: 'center',
    gap: 6,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  keyBox: {
    width: 58,
    height: 52,
    backgroundColor: '#30363d',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#58a6ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  keyChar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  keyLabel: {
    color: '#8b949e',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  swipeTip: {
    color: '#c9d1d9',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    borderRadius: 10,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  hazardBadgeRed: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#3d1d24',
    borderWidth: 1,
    borderColor: '#f85149',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardBadgeOrange: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#3b2a1a',
    borderWidth: 1,
    borderColor: '#d29922',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardBadgeFlame: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#3d1818',
    borderWidth: 1,
    borderColor: '#ff5533',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardBadgeBlue: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1b2f3d',
    borderWidth: 1,
    borderColor: '#388bfd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardIcon: {
    fontSize: 18,
  },
  hazardInfo: {
    flex: 1,
  },
  hazardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  hazardDesc: {
    color: '#8b949e',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: '#21262d',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipTitle: {
    color: '#ffd700',
    fontSize: 13,
    fontWeight: '800',
  },
  tipDesc: {
    color: '#8b949e',
    fontSize: 11.5,
    lineHeight: 16,
    marginLeft: 26,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#58a6ff',
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#238636',
    borderColor: '#2ea043',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    color: '#8b949e',
    fontSize: 11,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    backgroundColor: '#21262d',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevBtnText: {
    color: '#c9d1d9',
    fontSize: 13,
    fontWeight: '700',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#21262d',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    backgroundColor: '#238636',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#238636',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
