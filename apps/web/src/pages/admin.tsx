import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Send, 
  Youtube, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  KeyRound, 
  Save, 
  Eye, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  Search,
  Check,
  Zap,
  TrendingUp,
  X,
  Lock,
  Smartphone,
  Radio,
  Power,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const AdminPage = () => {
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem('jpilot_admin_session') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login flow state
  const [loginStep, setLoginStep] = useState<'password' | '2fa'>('password');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState<'users' | 'telegram-user' | 'settings' | 'invoices'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    cardNumber: '8600 0000 0000 0000',
    cardHolder: 'ADMINISTRATOR',
    basePrice: 60000,
    adminPin: '7777',
    tgBotToken: '',
    tgAdminChatId: '',
  });

  // Telegram User Account state
  const [tgUserStatus, setTgUserStatus] = useState<any>(null);
  const [tgPhone, setTgPhone] = useState('+998');
  const [tgCode, setTgCode] = useState('');
  const [tg2FAPassword, setTg2FAPassword] = useState('');
  const [tgStep, setTgStep] = useState<'enter_phone' | 'enter_code'>('enter_phone');
  const [tgSessionString, setTgSessionString] = useState('');
  const [tgLoading, setTgLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // SMS / CardXabar tester state
  const [testSmsText, setTestSmsText] = useState('Karta: *4589. Kirim: +60 042 UZS. Qoldiq: 1 250 000 UZS');
  const [testResult, setTestResult] = useState<any>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: Auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json',
  });

  // Step 1: Submit Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, pin: passwordInput }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setAuthError(data.error || 'Kirish vaqtincha bloklandi');
        return;
      }

      if (data.success) {
        if (data.requires2FA) {
          setLoginStep('2fa');
          setAuthMessage(data.message || 'Telegram hisobingizga 6 xonali tasdiqlash kodi yuborildi.');
        } else if (data.sessionToken) {
          setSessionToken(data.sessionToken);
          sessionStorage.setItem('jpilot_admin_session', data.sessionToken);
          setIsAuthenticated(true);
        }
      } else {
        setAuthError(data.error || 'Parol noto\'g\'ri kiritildi');
      }
    } catch (e) {
      setAuthError('Server bilan bog\'lanishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Telegram 2FA Code
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpInput }),
      });
      const data = await res.json();

      if (data.success && data.sessionToken) {
        setSessionToken(data.sessionToken);
        sessionStorage.setItem('jpilot_admin_session', data.sessionToken);
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Tasdiqlash kodi noto\'g\'ri');
      }
    } catch (e) {
      setAuthError('Kodni tekshirishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data
  const loadAdminData = async () => {
    if (!sessionToken) return;
    setIsLoading(true);
    try {
      const [usersRes, settingsRes, invoicesRes, tgRes] = await Promise.all([
        fetch('/api/admin/users', { headers: getAuthHeaders() }),
        fetch('/api/admin/settings', { headers: getAuthHeaders() }),
        fetch('/api/admin/invoices', { headers: getAuthHeaders() }),
        fetch('/api/admin/telegram-user/status', { headers: getAuthHeaders() }),
      ]);

      if (usersRes.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('jpilot_admin_session');
        setSessionToken('');
        return;
      }

      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();
      const invoicesData = await invoicesRes.json();
      const tgData = await tgRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (settingsData.success) setSettings(settingsData.settings);
      if (invoicesData.success) setInvoices(invoicesData.invoices);
      if (tgData.success) {
        setTgUserStatus(tgData);
        if (tgData.connected) {
          setTgStep('enter_phone');
        }
      }
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      loadAdminData();
    }
  }, [sessionToken]);

  // Activate user subscription
  const handleActivateUser = async (workspaceId: string, days: number = 30) => {
    try {
      const res = await fetch(`/api/admin/users/${workspaceId}/activate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAdminData();
      }
    } catch (e) {
      showNotification('Xatolik yuz berdi');
    }
  };

  // View channel details
  const handleViewChannel = async (workspaceId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${workspaceId}/channel`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setSelectedChannel(data.channel);
        setChannelModalOpen(true);
      } else {
        showNotification(data.message || 'Kanal ma\'lumotlari topilmadi');
      }
    } catch (e) {
      showNotification('Kanal ma\'lumotlarini olishda xatolik');
    }
  };

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✅ Karta va tizim sozlamalari muvaffaqiyatli saqlandi!');
      }
    } catch (e) {
      showNotification('Sozlamalarni saqlashda xatolik');
    }
  };

  // Telegram Userbot: Send Login Code
  const handleSendTgCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgLoading(true);
    try {
      const res = await fetch('/api/admin/telegram-user/send-code', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ phoneNumber: tgPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setTgStep('enter_code');
        showNotification(`✅ Kod ${tgPhone} Telegram ilovasiga yuborildi!`);
      } else {
        showNotification(`❌ Xatolik: ${data.error}`);
      }
    } catch (e) {
      showNotification('Telegramga kod yuborishda xatolik yuz berdi');
    } finally {
      setTgLoading(false);
    }
  };

  // Telegram Userbot: Sign In with Code
  const handleSignInTgCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgLoading(true);
    try {
      const res = await fetch('/api/admin/telegram-user/sign-in', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: tgCode, password: tg2FAPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('🎉 Telegram akkauntingiz muvaffaqiyatli ulandi!');
        setTgStep('enter_phone');
        setTgCode('');
        loadAdminData();
      } else {
        showNotification(`❌ Xatolik: ${data.error}`);
      }
    } catch (e) {
      showNotification('Kodni tasdiqlashda xatolik yuz berdi');
    } finally {
      setTgLoading(false);
    }
  };

  // Telegram Userbot: Connect with Session String
  const handleConnectSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgLoading(true);
    try {
      const res = await fetch('/api/admin/telegram-user/connect-session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionString: tgSessionString }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('🎉 Telegram akkaunt sessiya orqali ulandi!');
        setTgSessionString('');
        loadAdminData();
      } else {
        showNotification(`❌ Xatolik: ${data.error}`);
      }
    } catch (e) {
      showNotification('Sessiya orqali ulanishda xatolik');
    } finally {
      setTgLoading(false);
    }
  };

  // Telegram Userbot: Disconnect
  const handleDisconnectTg = async () => {
    if (!confirm('Haqiqatan ham Telegram akkauntingizni uzmoqchimisiz? CardXabar/HumoCard avtomat kuzatuvi to\'xtatiladi.')) return;
    try {
      const res = await fetch('/api/admin/telegram-user/disconnect', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Telegram akkaunti uzildi.');
        loadAdminData();
      }
    } catch (e) {
      showNotification('Uzishda xatolik yuz berdi');
    }
  };

  // Test SMS / CardXabar parsing
  const handleTestSms = async () => {
    try {
      const res = await fetch('/api/admin/simulate-notification', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: testSmsText }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.matched) {
        showNotification('✅ Matn mos keldi va to\'lov tasdiqlandi!');
        loadAdminData();
      }
    } catch (e) {
      setTestResult({ matched: false, message: 'Xatolik yuz berdi' });
    }
  };

  // 1. If not authenticated, show Secure Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md liquid-glass-red border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            {loginStep === 'password' ? <Lock size={32} /> : <Smartphone size={32} />}
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              {loginStep === 'password' ? 'Super Admin Kirish' : 'Telegram 2FA Tasdiqi'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {loginStep === 'password'
                ? 'Brute-force himoyasi faol (5 ta xato urinishdan so\'ng 15 daqiqaga bloklanadi).'
                : 'Sizning shaxsiy Telegramingizga 6 xonali bir martalik kod yuborildi.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-semibold">
              {authError}
            </div>
          )}

          {authMessage && (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-300 font-semibold">
              {authMessage}
            </div>
          )}

          {loginStep === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Murakkab admin parol / PIN"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-center text-base focus:outline-none focus:border-red-500 transition-colors"
                autoFocus
              />
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Tekshirilmoqda...' : 'Davom etish'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="6 xonali Telegram kodi"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:border-red-500 transition-colors"
                autoFocus
                maxLength={6}
              />
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Tasdiqlanmoqda...' : 'Kodni tasdiqlash'}
              </Button>
              <button
                type="button"
                onClick={() => setLoginStep('password')}
                className="text-xs text-gray-400 hover:text-gray-200 mt-2 block mx-auto"
              >
                ← Orqaga qaytish
              </button>
            </form>
          )}

          <div className="text-[11px] text-gray-500 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>256-bit Shifrlangan sessiya & IP Lockout himoyasi</span>
          </div>
        </div>
      </div>
    );
  }

  const isTgConnected = !!tgUserStatus?.connected;
  const activeSubscriptionsCount = users.filter((u) => u.subscription?.isActive && u.subscription?.status === 'active').length;
  const trialCount = users.filter((u) => u.subscription?.status === 'trial').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title="Jpilot Boshqaruv Paneli (Super Admin)"
        description="Foydalanuvchilar bazasi, oylik 60 000 so'm obunalar, to'lov kartasi va CardXabar/HumoCard Telegram integratsiyasi."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={loadAdminData} className="flex items-center gap-1.5">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Yangilash
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem('jpilot_admin_session');
                setSessionToken('');
                setIsAuthenticated(false);
              }}
              className="text-xs text-gray-400 hover:text-red-400"
            >
              Chiqish
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 text-sm font-semibold shadow-xl">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
            <Users size={16} className="text-blue-400" /> Jami Foydalanuvchilar
          </span>
          <div className="text-2xl font-black text-white">{users.length} ta</div>
          <span className="text-[11px] text-gray-500">Alohida ish maydonlari</span>
        </div>

        <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-1">
          <span className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
            <Zap size={16} className="text-emerald-400" /> Faol Pullik Obunalar
          </span>
          <div className="text-2xl font-black text-white">{activeSubscriptionsCount} ta</div>
          <span className="text-[11px] text-emerald-400">Oylik 60 000 so'm to'langan</span>
        </div>

        <div className="liquid-glass p-5 rounded-2xl border border-blue-500/20 bg-blue-950/10 space-y-1">
          <span className="text-xs text-blue-300 flex items-center gap-1.5 font-medium">
            <Smartphone size={16} className="text-blue-400" /> Telegram Akkaunt
          </span>
          <div className="text-base font-bold text-white flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isTgConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isTgConnected ? (tgUserStatus?.user?.username ? `@${tgUserStatus.user.username}` : 'Ulangan') : 'Ulanmagan'}
          </div>
          <span className="text-[11px] text-gray-400">CardXabar & HumoCard</span>
        </div>

        <div className="liquid-glass-red p-5 rounded-2xl border border-red-500/20 space-y-1">
          <span className="text-xs text-red-300 flex items-center gap-1.5 font-medium">
            <CreditCard size={16} className="text-red-400" /> Kutilayotgan Invoyslar
          </span>
          <div className="text-2xl font-black text-white">
            {invoices.filter((i) => i.status === 'pending').length} ta
          </div>
          <span className="text-[11px] text-red-400">1..99 unikal summada</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-red-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users size={16} /> Foydalanuvchilar ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('telegram-user')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'telegram-user'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Smartphone size={16} /> Telegram Akkaunt (CardXabar & HumoCard)
          {isTgConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-red-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <CreditCard size={16} /> Karta va Parol Sozlamalari
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-red-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Send size={16} /> To'lovlar & Invoyslar ({invoices.length})
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-5 py-4">Workspace ID</th>
                    <th className="px-5 py-4">Ulangan Gmail</th>
                    <th className="px-5 py-4">YouTube Kanal</th>
                    <th className="px-5 py-4">Obuna Holati</th>
                    <th className="px-5 py-4">Muddati</th>
                    <th className="px-5 py-4 text-right">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => {
                    const isSubActive = user.subscription?.isActive && user.subscription?.status === 'active';
                    const isTrial = user.subscription?.status === 'trial';
                    return (
                      <tr key={user.workspaceId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-white text-xs">
                          {user.workspaceId}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-gray-200">{user.userGmail}</span>
                        </td>
                        <td className="px-5 py-4">
                          {user.hasYouTube ? (
                            <button
                              onClick={() => handleViewChannel(user.workspaceId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-600/30 transition-colors shadow-sm"
                            >
                              <Youtube size={14} className="fill-red-500 text-red-500" />
                              {user.channel?.title || 'Kanalni ko\'rish'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Ulanmagan</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isSubActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <Check size={12} /> Faol (Pullik)
                            </span>
                          ) : isTrial ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock size={12} /> Sinov (Trial)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              Muddati tugagan
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-300 font-mono">
                          {user.subscription?.daysLeft !== undefined
                            ? `${user.subscription.daysLeft} kun qoldi`
                            : 'Noma\'lum'}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleActivateUser(user.workspaceId, 30)}
                            className="text-xs shadow-md"
                          >
                            +30 kun Obuna
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TELEGRAM USER ACCOUNT (USERBOT) */}
      {activeTab === 'telegram-user' && (
        <div className="space-y-6">
          {isTgConnected ? (
            /* Connected State */
            <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 shadow-2xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <Radio size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-xl font-bold text-white">
                        Telegram Akkaunt Ulangan va Jonli Kuzatuv Faol!
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Foydalanuvchi: <strong className="text-white">{tgUserStatus?.user?.firstName} {tgUserStatus?.user?.lastName}</strong> {tgUserStatus?.user?.username ? `(@${tgUserStatus.user.username})` : ''} • Tel: <strong className="text-white font-mono">{tgUserStatus?.user?.phone}</strong>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnectTg} className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                  <Power size={14} className="mr-1.5" /> Akkauntni uzish
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-gray-300 block">Doimiy kuzatilayotgan manbalar:</span>
                <div className="flex flex-wrap gap-2">
                  {tgUserStatus?.monitoredChannels?.map((ch: string) => (
                    <span key={ch} className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold">
                      {ch}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
                  Ushbu botlardan sizning shaxsiy Telegramingizga kelgan har qanday to'lov xabarnomasi (masalan, <code>Karta: *1234, Kirim: +60 042 UZS</code>) soniyalar ichida ushlanadi va tegishli foydalanuvchi obunasi 30 kunga avtomatik yoqiladi.
                </p>
              </div>

              {/* Live Intercepted Messages Feed */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> Telegramdan Ushlangan So'nggi Xabarlar
                </h4>
                {tgUserStatus?.recentLogs?.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-400">
                    Hozircha xabarlar tushmadi. CardXabar yoki HumoCard botidan pul tushumi haqida xabar kelishi bilan shu yerda ko'rinadi.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {tgUserStatus?.recentLogs?.map((log: any) => (
                      <div key={log.id} className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        log.matched ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-white/[0.03] border-white/10 text-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{log.sender}</span>
                            {log.matched && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                ✅ To'lov Tasdiqlandi ({log.extractedAmount} UZS)
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(log.date).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-mono text-xs break-all bg-black/30 p-2 rounded-lg">{log.text}</p>
                        {log.workspaceId && (
                          <span className="text-[11px] text-emerald-400 font-mono block">
                            Faollashtirilgan Workspace: <strong>{log.workspaceId}</strong>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Disconnected State: Connect Forms */
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
              {/* Method 1: Phone + Login Code */}
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">1-Usul: Telefon Raqam Orqali</h3>
                    <p className="text-xs text-gray-400">Telegram ilovangizga keladigan kod orqali ulanish</p>
                  </div>
                </div>

                {tgStep === 'enter_phone' ? (
                  <form onSubmit={handleSendTgCode} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Sizning Telegram Telefon Raqamingiz:
                      </label>
                      <input
                        type="text"
                        value={tgPhone}
                        onChange={(e) => setTgPhone(e.target.value)}
                        placeholder="+998901234567"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-blue-500"
                        required
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        CardXabar yoki HumoCard xabarnomalari keladigan shaxsiy raqamingiz.
                      </span>
                    </div>

                    <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500" disabled={tgLoading}>
                      <Send size={16} /> {tgLoading ? 'Kod yuborilmoqda...' : 'Telegramga Kod Yuborish'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignInTgCode} className="space-y-4">
                    <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-blue-200">
                      <strong>{tgPhone}</strong> raqamiga Telegram ilovangiz orqali 5 xonali kirish kodi yuborildi. Iltimos, Telegramingizni ochib kodni kiriting.
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Telegramdan Kelgan Kod:
                      </label>
                      <input
                        type="text"
                        value={tgCode}
                        onChange={(e) => setTgCode(e.target.value)}
                        placeholder="12345"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-center text-xl tracking-widest focus:outline-none focus:border-blue-500"
                        autoFocus
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        2FA Bulutli Parol (faqat Telegramingizda 2FA yoqilgan bo'lsa):
                      </label>
                      <input
                        type="password"
                        value={tg2FAPassword}
                        onChange={(e) => setTg2FAPassword(e.target.value)}
                        placeholder="Telegram bulutli paroli (ixtiyoriy)"
                        className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-500" disabled={tgLoading}>
                        {tgLoading ? 'Ulanmoqda...' : 'Ulanish va Kuzatuvni Boshlash'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setTgStep('enter_phone')}>
                        Bekor qilish
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Method 2: StringSession Direct Input */}
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <KeyRound size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">2-Usul: Sessiya Matni (StringSession)</h3>
                    <p className="text-xs text-gray-400">Telethon / Pyrogram sessiya kaliti orqali 1 soniyada ulanish</p>
                  </div>
                </div>

                <form onSubmit={handleConnectSession} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Telegram StringSession matni:
                    </label>
                    <textarea
                      rows={4}
                      value={tgSessionString}
                      onChange={(e) => setTgSessionString(e.target.value)}
                      placeholder="1BJWap1wBu8..."
                      className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Agar avval StringSession generatsiya qilgan bo'lsangiz, uni to'g'ridan-to'g'ri joylashtirishingiz mumkin.
                    </span>
                  </div>

                  <Button type="submit" variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={tgLoading}>
                    <ArrowRight size={16} /> {tgLoading ? 'Ulanmoqda...' : 'Sessiya Orqali Ulanish'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <form onSubmit={handleSaveSettings} className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard size={20} className="text-red-500" /> To'lov Qabul Qilish Karta Ma'lumotlari
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Karta Raqami (Uzcard / Humo):
                </label>
                <input
                  type="text"
                  value={settings.cardNumber}
                  onChange={(e) => setSettings({ ...settings, cardNumber: e.target.value })}
                  placeholder="8600 0000 0000 0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Foydalanuvchilarga to'lov oynasida aynan shu karta raqam ko'rsatiladi.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Karta Egasi (F.I.O):
                </label>
                <input
                  type="text"
                  value={settings.cardHolder}
                  onChange={(e) => setSettings({ ...settings, cardHolder: e.target.value })}
                  placeholder="JAHONGIR T."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Oylik Obuna Asosiy Narxi (UZS):
                </label>
                <input
                  type="number"
                  value={settings.basePrice}
                  onChange={(e) => setSettings({ ...settings, basePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Standart: 60 000 so'm. Unga 1..99 so'm unikal qo'shimcha qo'shiladi.
                </span>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Admin Panel Paroli:
                </label>
                <input
                  type="text"
                  value={settings.adminPin}
                  onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                  placeholder="KuchliParol#2026!"
                  className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Standart: <code className="text-emerald-400">7777</code>. Xohlagan yangi parol qo'yishingiz mumkin.
                </span>
              </div>

              <Button type="submit" variant="primary" className="flex items-center gap-2 shadow-lg">
                <Save size={16} /> Sozlamalarni saqlash
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: INVOICES & SMS PARSER TEST */}
      {activeTab === 'invoices' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* CardXabar / HumoCard Parser Tester */}
          <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" /> CardXabar & HumoCard Sinov Maydoni
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Bu yerda bankdan yoki CardXabar botidan keladigan SMS/xabar matnini kiritib sinab ko'rishingiz mumkin.
              Tizim 1..99 unikal summani avtomatik aniqlab, tegishli foydalanuvchi obunasini 30 kunga yoqadi.
            </p>

            <textarea
              rows={3}
              value={testSmsText}
              onChange={(e) => setTestSmsText(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-red-500"
              placeholder="SMS matnini kiriting..."
            />

            <Button variant="primary" size="sm" onClick={handleTestSms} className="flex items-center gap-2">
              <Zap size={14} /> Xabarni tekshirish va Obunani yoqish
            </Button>

            {testResult && (
              <div className={`p-4 rounded-xl text-xs space-y-1 ${
                testResult.matched ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border border-red-500/40 text-red-300'
              }`}>
                <div className="font-bold">{testResult.matched ? '✅ Natija: Qabul qilindi' : '❌ Natija: Mos kelmadi'}</div>
                <div>{testResult.message}</div>
                {testResult.extractedAmount && <div>Aniqlangan summa: <strong>{testResult.extractedAmount} UZS</strong></div>}
                {testResult.workspaceId && <div>Faollashtirilgan Workspace: <strong>{testResult.workspaceId}</strong></div>}
              </div>
            )}
          </div>

          {/* Invoices List */}
          <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-red-500" /> So'nggi To'lov Invoyslari
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {invoices.length === 0 ? (
                <div className="text-xs text-gray-500 py-8 text-center">Hozircha invoyslar mavjud emas</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{inv.totalAmount.toLocaleString()} UZS</span>
                        <span className="text-[10px] text-gray-400 font-mono">(+{inv.uniqueOffset} so'm)</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">{inv.workspaceId}</span>
                    </div>
                    <div className="text-right">
                      {inv.status === 'paid' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          To'landi
                        </span>
                      ) : inv.status === 'pending' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Kutilmoqda
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                          Muddati o'tdi
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE CHANNEL DETAILS MODAL */}
      {channelModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg liquid-glass-red border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChannel.thumbnailUrl ? (
                  <img src={selectedChannel.thumbnailUrl} alt="Channel" className="w-12 h-12 rounded-full border border-red-500/40" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                    <Youtube size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black">{selectedChannel.title}</h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedChannel.id}</p>
                </div>
              </div>
              <button
                onClick={() => setChannelModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-[11px] text-gray-400 block">Obunachilar</span>
                <span className="text-base font-bold text-white">{Number(selectedChannel.subscriberCount).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-[11px] text-gray-400 block">Ko'rishlar</span>
                <span className="text-base font-bold text-white">{Number(selectedChannel.viewCount).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-[11px] text-gray-400 block">Videolar</span>
                <span className="text-base font-bold text-white">{selectedChannel.videoCount} ta</span>
              </div>
            </div>

            {selectedChannel.description && (
              <div className="text-xs text-gray-300 bg-black/30 p-3 rounded-xl border border-white/5 max-h-28 overflow-y-auto">
                <strong className="block text-gray-400 mb-1">Tavsif:</strong>
                {selectedChannel.description}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <a
                href={selectedChannel.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                YouTube'da ochish <ExternalLink size={14} />
              </a>
              <Button variant="secondary" size="sm" onClick={() => setChannelModalOpen(false)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
