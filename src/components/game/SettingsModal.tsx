import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ControlMode } from '@/types/game';

interface SettingsModalProps {
  visible: boolean;
  currentMode: ControlMode;
  onSelectMode: (mode: ControlMode) => void;
  onClose: () => void;
}

interface ControlOption {
  id: ControlMode;
  icon: string;
  title: string;
  badge: string;
  description: string;
}

const CONTROL_OPTIONS: ControlOption[] = [
  {
    id: 'wasd',
    icon: '⌨️',
    title: 'Keyboard WASD',
    badge: 'Desktop / PC',
    description: 'Tekan tombol W (atas), A (kiri), S (bawah), D (kanan) pada keyboard.',
  },
  {
    id: 'arrows',
    icon: '⬆️',
    title: 'Tombol Panah (Arrow Keys)',
    badge: 'Desktop / PC',
    description: 'Tekan tombol Panah Atas, Bawah, Kiri, dan Kanan pada keyboard.',
  },
  {
    id: 'swipe',
    icon: '🖱️',
    title: 'Swipe Mouse / Layar Sentuh',
    badge: 'Mouse & Mobile',
    description: 'Geser (drag) kursor mouse atau usap layar HP sesuai arah lompatan.',
  },
];

export default function SettingsModal({
  visible,
  currentMode,
  onSelectMode,
  onClose,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleIcon}>⚙️</Text>
            <Text style={styles.titleText}>PENGATURAN KONTROL</Text>
          </View>
          <Text style={styles.subtitleText}>
            Pilih metode kontrol pergerakan katak yang Anda inginkan:
          </Text>

          {/* Options List */}
          <View style={styles.optionsList}>
            {CONTROL_OPTIONS.map((option) => {
              const isSelected = currentMode === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => onSelectMode(option.id)}
                >
                  <View style={styles.optionTopRow}>
                    <View style={styles.optionTitleGroup}>
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.optionTitle,
                          isSelected && styles.optionTitleSelected,
                        ]}
                      >
                        {option.title}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </View>

                  <Text style={styles.optionDesc}>{option.description}</Text>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        isSelected && styles.badgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          isSelected && styles.badgeTextSelected,
                        ]}
                      >
                        {option.badge}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.saveButtonText}>SIMPAN & LANJUT BERMAIN ✅</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#20242a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3a414d',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 8,
  },
  titleIcon: {
    fontSize: 24,
  },
  titleText: {
    color: '#f3c442',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitleText: {
    color: '#a0aab8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionItem: {
    backgroundColor: '#2a3038',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#3d4552',
  },
  optionItemSelected: {
    backgroundColor: '#1f3b2e',
    borderColor: '#42b983',
  },
  optionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionTitle: {
    color: '#e5e9f0',
    fontSize: 14,
    fontWeight: '700',
  },
  optionTitleSelected: {
    color: '#55e6a5',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#606b7a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#42b983',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#42b983',
  },
  optionDesc: {
    color: '#98a2b0',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    marginLeft: 26,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 26,
  },
  badge: {
    backgroundColor: '#353c46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSelected: {
    backgroundColor: '#1b5238',
  },
  badgeText: {
    color: '#8c96a5',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextSelected: {
    color: '#76e7b1',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#1e8449',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
