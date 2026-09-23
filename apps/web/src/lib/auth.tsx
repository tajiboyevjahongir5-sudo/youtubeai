import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth via httpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      // Clean up legacy insecure localStorage token if present
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jpilot_auth_token');
      }

      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            if (data.user.workspaceId && typeof window !== 'undefined') {
              localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.warn('Tarmoq aloqasi xatosi:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // response might be HTML error from proxy/server
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || data?.message || (res.status === 504 ? 'Server javob berish vaqti tugadi (504 Gateway Timeout)' : res.status === 502 ? 'Backend serveri ishlamayapti (502 Bad Gateway)' : res.status === 404 ? 'API manzili topilmadi (404 Not Found)' : `Kirishda xatolik (${res.status})`);
        return { success: false, error: errorMsg };
      }
      
      if (data.user?.workspaceId && typeof window !== 'undefined') {
        localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
      }
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Backend server bilan bog‘lanib bo‘lmadi. Tarmoq yoki server holatini tekshiring.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // response might be HTML error
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || data?.message || (res.status === 504 ? 'Server javob berish vaqti tugadi (504 Gateway Timeout)' : res.status === 502 ? 'Backend serveri ishlamayapti (502 Bad Gateway)' : res.status === 404 ? 'API manzili topilmadi (404 Not Found)' : `Ro'yxatdan o'tishda xatolik (${res.status})`);
        return { success: false, error: errorMsg };
      }
      
      if (data.user?.workspaceId && typeof window !== 'undefined') {
        localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
      }
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Backend server bilan bog‘lanib bo‘lmadi. Tarmoq yoki server holatini tekshiring.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jpilot_auth_token');
      localStorage.removeItem('jpilot_workspace_id');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
