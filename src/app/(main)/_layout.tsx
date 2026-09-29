import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function MainLayout() {
  const { username, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <Drawer
      drawerContent={({ navigation }) => (
        <View style={styles.container}>
          {/* Header Drawer */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Pemain Aktif</Text>
            <Text style={styles.username}>
              {username || 'Guest'}
            </Text>
          </View>

          {/* Menu Drawer */}
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                navigation.closeDrawer();
                router.push('/highscores');
              }}
            >
              <Text style={styles.menuText}>🏆 High Score</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>🚪 Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16181b',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#1f2328',
    borderBottomWidth: 1,
    borderBottomColor: '#2d333b',
  },

  headerLabel: {
    color: '#9ba0a6',
    fontSize: 13,
    marginBottom: 6,
  },

  username: {
    color: '#8ce258',
    fontSize: 22,
    fontWeight: '800',
  },

  menu: {
    paddingTop: 16,
  },

  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  menuText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  bottom: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#2d333b',
    paddingBottom: 20,
  },

  logoutItem: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },

  logoutText: {
    color: '#f85149',
    fontSize: 16,
    fontWeight: '700',
  },
});



















// import { Stack } from 'expo-router';

// export default function MainLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" />
//     </Stack>
//   );
// }
