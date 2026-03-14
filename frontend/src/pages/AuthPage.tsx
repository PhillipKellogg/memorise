import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '@/components/Nav';
import { useAuth } from '@/hooks/useAuth';

interface AuthPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

const AuthPage = ({ isDark, onToggleTheme }: AuthPageProps): JSX.Element => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!username.trim() || !password.trim() || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError<{ detail?: string }>(err)) {
        const { detail } = err.response?.data ?? {};
        if (detail === 'Username already taken') {
          setError('That username is already taken.');
        } else if (detail === 'Invalid credentials') {
          setError('Wrong username or password.');
        } else {
          setError('Something went wrong. Try again.');
        }
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register'): void => {
    setMode(next);
    setError('');
  };

  const getButtonLabel = (): string => {
    if (isLoading) return '…';
    return mode === 'login' ? 'Sign in →' : 'Create account →';
  };

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          <div className="neu-inset rounded-2xl p-1 flex mb-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${
                mode === 'login' ? 'neu-btn text-accent' : 'text-muted'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${
                mode === 'register' ? 'neu-btn text-accent' : 'text-muted'
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold text-neu mb-8 text-center">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-body">Username</p>
                <input
                  className="neu-input w-full"
                  placeholder="your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-body">Password</p>
                <input
                  type="password"
                  className="neu-input w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-body text-center mb-4">{error}</p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={!username.trim() || !password.trim() || isLoading}
              className="neu-btn w-full py-3 rounded-2xl text-accent font-body font-semibold text-sm disabled:opacity-40"
            >
              {getButtonLabel()}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;
