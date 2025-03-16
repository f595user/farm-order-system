import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/pages/Home';
import Products from './components/pages/Products';
import ProductDetail from './components/pages/ProductDetail';
import Order from './components/pages/Order';
import Account from './components/pages/Account';
import Admin from './components/pages/Admin';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GoogleLogout from './components/auth/GoogleLogout';
import NotFound from './components/pages/NotFound';
import PrivateRoute from './components/auth/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { loading } = useAuth();

  // Add a timeout to automatically reset loading state if it gets stuck
  useEffect(() => {
    let loadingTimeout;
    
    if (loading) {
      // If loading state is true, set a timeout to force reset it after 10 seconds
      loadingTimeout = setTimeout(() => {
        console.log('Loading state was stuck for too long, forcing reset');
        window.location.href = '/';
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      // Clear the timeout when component unmounts or loading state changes
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loading]);
  
  // Check for logout parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const logoutParam = urlParams.get('logout');
    
    if (logoutParam === 'true') {
      console.log('Logout parameter detected in URL, ensuring user is logged out');
      
      // Clear all localStorage items that might be related to authentication
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('token') || 
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('session') || 
          key.includes('google')
        )) {
          localStorage.removeItem(key);
        }
      }
      
      // Specifically remove known keys
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('googleUser');
      
      // Clear all cookies
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      
      // Specifically clear known cookies
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Remove the logout parameter from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Force a hard reload of the page to ensure a clean state
      // This is more aggressive than just updating the React state
      if (logoutParam.includes('reload')) {
        console.log('Forcing page reload to ensure clean state');
        window.location.reload(true); // true forces a reload from the server, not from cache
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
        <p className="loading-timeout-message">
          長時間経過する場合は<button onClick={() => window.location.href = '/'} className="btn-link">こちら</button>をクリックしてください
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Special route for Google logout - outside of Layout to avoid header/footer */}
        <Route path="/google-logout" element={<GoogleLogout />} />
        
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="order" 
            element={
              <PrivateRoute>
                <Order />
              </PrivateRoute>
            } 
          />
          <Route 
            path="account" 
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="admin" 
            element={
              <PrivateRoute adminOnly={true}>
                <Admin />
              </PrivateRoute>
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
