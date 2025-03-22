import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Check URL for logout parameter
        const urlParams = new URLSearchParams(window.location.search);
        const hasLogout = urlParams.get('logout');
        
        // If logout parameter is present, don't even try to fetch the user
        if (hasLogout) {
          console.log('Logout parameter detected in URL, skipping user fetch');
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Add cache-busting timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/users/current?t=${timestamp}`, {
          credentials: 'include',
          cache: 'no-store' // Prevent caching
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          // Not authenticated, but not an error
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('認証情報の取得に失敗しました。');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ログインに失敗しました。');
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登録に失敗しました。');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Logging out user...');
      
      // Note: Google users are handled directly in the Header component
      // This method is now primarily for non-Google users
      
      // Reset user state immediately to avoid any state issues
      setCurrentUser(null);
      
      // Clear any auth-related data from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('googleUser');
      localStorage.removeItem('session');
      
      // クライアント側のクッキーをクリア - より徹底的に
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
      
      // Call the logout API with timeout handling
      try {
        // Create an abort controller for timeout management
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set up timeout - abort after 3 seconds
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 3000);
        
        console.log('Calling logout API with 3 second timeout');
        
        // キャッシュを防ぐためにタイムスタンプを追加
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/users/logout?t=${timestamp}`, {
          credentials: 'include',
          signal,
          cache: 'no-store' // キャッシュを使用しない
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('Logout API error:', response.status);
        } else {
          console.log('Server logout successful');
        }
      } catch (apiError) {
        // Check if this was a timeout error
        if (apiError.name === 'AbortError') {
          console.log('Logout API request timed out, continuing with client-side logout');
        } else {
          console.error('API call error during logout:', apiError);
        }
      }
      
      console.log('Logout successful, user state already reset');
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'ログアウトに失敗しました。');
      
      // Still reset the user state even on error
      setCurrentUser(null);
      
      // Try to clear cookies even on error - より徹底的に
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
      
      throw err;
    } finally {
      console.log('Resetting loading state after logout');
      setLoading(false);
    }
  };

  const googleLogin = (redirectPath) => {
    // Construct the Google auth URL with the redirect path as a query parameter
    let authUrl = '/api/users/auth/google';
    
    // Add the redirect path as a query parameter if provided
    if (redirectPath) {
      authUrl += `?redirect=${encodeURIComponent(redirectPath)}`;
    }
    
    // Redirect to Google auth endpoint
    window.location.href = authUrl;
  };

  const isAuthenticated = () => {
    return !!currentUser;
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const value = {
    currentUser,
    setCurrentUser, // Expose setCurrentUser for direct state manipulation
    loading,
    error,
    login,
    register,
    logout,
    googleLogin,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
