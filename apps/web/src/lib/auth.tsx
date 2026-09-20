import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jpilot_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jpilot_auth_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setUser(data.user);
              if (data.user.workspaceId) {
                localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
              }
            } else {
              localStorage.removeItem('jpilot_auth_token');
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem('jpilot_auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.warn('Tarmoq aloqasi xatosi:', error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Kirishda xatolik yuz berdi' };
      }
      
      localStorage.setItem('jpilot_auth_token', data.token);
      if (data.user?.workspaceId) {
        localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
      }
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Tarmoq xatosi' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Ro'yxatdan o'tishda xatolik yuz berdi" };
      }
      
      localStorage.setItem('jpilot_auth_token', data.token);
      if (data.user?.workspaceId) {
        localStorage.setItem('jpilot_workspace_id', data.user.workspaceId);
      }
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Tarmoq xatosi' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jpilot_auth_token');
    localStorage.removeItem('jpilot_workspace_id');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
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
