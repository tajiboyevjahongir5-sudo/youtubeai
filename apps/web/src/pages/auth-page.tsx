import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Play } from 'lucide-react';
import { clsx } from 'clsx';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.error || 'Xatolik yuz berdi');
        }
      } else {
        if (password !== confirmPassword) {
          setError('Parollar mos kelmadi');
          setIsSubmitting(false);
          return;
        }
        const res = await register(name, email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.error || 'Xatolik yuz berdi');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Tizim xatoligi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070a] studio-grid-bg relative px-4">
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-[1.5px] shadow-[0_0_20px_rgba(255,0,50,0.4)]">
              <div className="w-full h-full bg-[#0d0d14] rounded-[14px] flex items-center justify-center">
                <Play size={24} className="fill-red-500 text-red-500 ml-1" />
              </div>
            </div>
            <span className="text-3xl font-black text-white tracking-tight group-hover:text-red-400 transition-colors">JPILOT</span>
          </Link>
        </div>

        <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="flex border-b border-white/10">
            <button
              className={clsx(
                "flex-1 py-4 text-sm font-bold transition-all",
                isLogin ? "text-red-500 border-b-2 border-red-500 bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Kirish
            </button>
            <button
              className={clsx(
                "flex-1 py-4 text-sm font-bold transition-all",
                !isLogin ? "text-red-500 border-b-2 border-red-500 bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Ro'yxatdan O'tish
            </button>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Ism"
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Parol"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <Input
                  label="Parolni Tasdiqlang"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              {error && <div className="text-red-400 text-sm font-medium text-center p-2 bg-red-500/10 rounded-lg">{error}</div>}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 shadow-[0_0_15px_rgba(255,0,50,0.3)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Yuklanmoqda...
                  </span>
                ) : isLogin ? (
                  "Tizimga Kirish"
                ) : (
                  "Ro'yxatdan O'tish"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
