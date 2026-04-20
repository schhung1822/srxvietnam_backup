/* eslint-disable react-refresh/only-export-components */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await parseJson(response);
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const register = async (payload) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(data.message ?? 'Không thể đăng ký.');
    }

    setUser(data.user ?? null);
    return data.user;
  };

  const login = async (payload) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(data.message ?? 'Không thể đăng nhập.');
    }

    setUser(data.user ?? null);
    return data.user;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout,
        refreshUser,
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
