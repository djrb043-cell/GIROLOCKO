import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import LojistaDashboard from '@/pages/lojista/LojistaDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

function Notice({ icon, title, text, onSignOut }: { icon: string; title: string; text: string; onSignOut: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">{icon}</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{text}</p>
        <button
          onClick={onSignOut}
          className="px-5 py-2.5 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-600 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

function AppRouter() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <LoadingSpinner fullscreen />;
  if (!user) return <Login />;

  if (!profile) {
    return (
      <Notice
        icon="⚠️"
        title="Perfil não encontrado"
        text="Seu login existe, mas a conta ainda não foi configurada no sistema. Entre em contato com a GiroLoc."
        onSignOut={signOut}
      />
    );
  }

  if (!profile.active) {
    return (
      <Notice
        icon="⛔"
        title="Conta desativada"
        text="Sua conta foi desativada pelo administrador. Entre em contato com a GiroLoc para reativação."
        onSignOut={signOut}
      />
    );
  }

  return profile.role === 'admin' ? <AdminDashboard /> : <LojistaDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
