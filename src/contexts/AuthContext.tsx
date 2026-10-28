import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, Profile } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** Retorna null se deu certo, ou o código de erro do Firebase (ex.: "auth/invalid-credential"). */
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'profiles', uid));
      if (snap.exists()) setProfile({ ...(snap.data() as Omit<Profile, 'id'>), id: snap.id });
      else setProfile(null);
    } catch (err) {
      console.error('Erro ao buscar o perfil:', err);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        await fetchProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown';
      console.error('Erro no login:', code, err);
      return code;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
