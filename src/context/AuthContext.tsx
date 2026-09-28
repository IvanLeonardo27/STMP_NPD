import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { clearUsername, getStoredUsername, storeUsername } from '../services/storage';

interface AuthContextType {
  username: string;
  isLoggedIn: boolean;
  isReady: boolean;
  login: (newUsername: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    async function checkAuth() {
      try {
        const stored = await getStoredUsername();
        if (!isCancelled) {
          if (stored && stored.trim().length > 0) {
            setUsername(stored.trim());
            setIsLoggedIn(true);
          } else {
            setUsername('');
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Failed to load username', error);
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (newUsername: string) => {
    const cleanName = newUsername.trim();
    if (!cleanName) return;
    await storeUsername(cleanName);
    setUsername(cleanName);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await clearUsername();
    setUsername('');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        isLoggedIn,
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
