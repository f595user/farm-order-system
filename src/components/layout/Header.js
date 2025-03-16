import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, isAuthenticated, isAdmin, logout, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Initiating logout process...');
      
      // Set a flag to indicate we're in the logout process
      window.isLoggingOut = true;
      
      // Check if user is logged in with Google before logging out
      const isGoogleUser = currentUser && currentUser.googleId;
      console.log('Is Google user (from Header):', isGoogleUser);
      
      // Reset user state immediately to update UI
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
      
      // For Google users, navigate to the GoogleLogout component
      // which will handle both client and server-side logout
      if (isGoogleUser) {
        console.log('Google user detected, navigating to GoogleLogout component');
        navigate('/google-logout');
        return;
      }
      
      // For non-Google users, proceed with normal logout
      // Set up a timeout to ensure we don't wait too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Logout timed out'));
        }, 3000); // 3 second timeout
      });
      
      try {
        // Race between the logout call and the timeout
        await Promise.race([
          logout(),
          timeoutPromise
        ]);
      } catch (timeoutError) {
        console.warn('Logout API call timed out, continuing with client-side logout');
      }
      
      console.log('Logout successful, navigating to home page');
      
      // Navigate to home page with cache-busting query parameter
      navigate('/?logout=true&t=' + new Date().getTime());
      
      // Show success message
      alert('ログアウトしました。');
      
      // Reset the logout flag
      window.isLoggingOut = false;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even on error, ensure we're logged out on the client side
      setCurrentUser(null);
      
      // クライアント側のクッキーをクリア - より徹底的に (エラー時も)
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
      
      alert(`ログアウトに失敗しました: ${error.message || 'Unknown error'}`);
      
      // Even on error, try to navigate to home page with cache-busting
      navigate('/?logout=true&t=' + new Date().getTime());
      
      // Reset the logout flag
      window.isLoggingOut = false;
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header>
      <div className="container">
        <div className="logo">
          <h1><Link to="/">ロマンス農園</Link></h1>
        </div>
        
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </div>
        
        <nav className={showMobileMenu ? 'mobile-active' : ''}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>ホーム</NavLink>
            </li>
            <li>
              <NavLink to="/products">商品一覧</NavLink>
            </li>
            <li>
              <NavLink to="/order">注文</NavLink>
            </li>
            <li>
              <NavLink to="/account">アカウント</NavLink>
            </li>
            {isAdmin() && (
              <li className="admin-link">
                <NavLink to="/admin">管理者</NavLink>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="user-actions">
          {!isAuthenticated() ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn">ログイン</Link>
              <Link to="/register" className="btn btn-primary">登録</Link>
            </div>
          ) : (
            <div className="user-profile">
              <span className="user-name">{currentUser?.name || 'ユーザー'}</span>
              <button onClick={handleLogout} className="btn">ログアウト</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
