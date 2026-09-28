import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const [inputUsername, setInputUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const trimmed = inputUsername.trim();
    if (!trimmed) {
      const msg = 'Silakan masukkan username terlebih dahulu!';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Perhatian', msg);
      }
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length < 2) {
      const msg = 'Username minimal terdiri dari 2 karakter.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Perhatian', msg);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmed);
      router.replace('/(main)' as any);
    } catch (error) {
      console.error('Login error', error);
      const msg = 'Gagal menyimpan username ke Shared Preferences. Silakan coba lagi.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.centeredWrapper}>
          {/* Fixed aspect ratio frame maintaining exact 576:1024 design proportions */}
          <View style={styles.phoneFrame}>
            <ImageBackground
              source={require('@/assets/images/ui/login_screen_clean.png')}
              style={styles.backgroundImage}
              resizeMode="contain"
            >
              {/* Clickable area focusing the textinput */}
              <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
                <View style={styles.inputAreaWrapper}>
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    placeholder="Masukkan Username"
                    placeholderTextColor="#9ca3af"
                    value={inputUsername}
                    onChangeText={setInputUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </TouchableWithoutFeedback>

              {/* Exact touchable target over the 3D MASUK button */}
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.masukButtonArea}
                onPress={handleLogin}
                disabled={isSubmitting}
              />
            </ImageBackground>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1a1d21',
  },
  keyboardView: {
    flex: 1,
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1d21',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 480,
    aspectRatio: 576 / 1024,
    maxHeight: WINDOW_HEIGHT,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  // Sits seamlessly inside the white pill box next to the user icon (X=192..418, Y=288..329)
  inputAreaWrapper: {
    position: 'absolute',
    top: '28.12%',
    left: '33.33%',
    width: '39.23%',
    height: '4.00%',
    justifyContent: 'center',
  },
  textInput: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },

  // Sits seamlessly right on top of the MASUK button (X=168..408, Y=354..399)
  masukButtonArea: {
    position: 'absolute',
    top: '34.57%',
    left: '29.17%',
    width: '41.67%',
    height: '4.39%',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
});
