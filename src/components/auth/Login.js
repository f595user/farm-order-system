import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state
  const from = location.state?.from?.pathname;
  
  // Get the referrer path to determine where the user came from
  const referrer = location.state?.referrer;

  // Determine the redirect destination based on the path
  const getRedirectDestination = () => {
    // If coming from header login button, go to home
    if (referrer === 'header') {
      return '/';
    }
    
    // If there's a specific path the user was trying to access (protected route)
    if (from) {
      // For specific paths we want to maintain
      if (from === '/order' || from === '/account' || from.startsWith('/account/')) {
        return from;
      }
      
      // For products page with "注文を開始" button, redirect to order page
      if (from === '/products' && location.state?.startOrder) {
        return '/order';
      }
    }
    
    // Default fallback is home page
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await login({ email, password });
      
      // Redirect based on our logic
      const redirectTo = getRedirectDestination();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Get the redirect destination
    const redirectTo = getRedirectDestination();
    // Pass the redirect path to the googleLogin function
    googleLogin(redirectTo);
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>ログイン</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">メールアドレス</label>
            <input 
              type="email" 
              id="login-email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="login-password">パスワード</label>
            <input 
              type="password" 
              id="login-password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="social-login">
          <p>または</p>
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="btn btn-google"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
              width="18" 
              height="18" 
            />
            Googleでログイン
          </button>
        </div>
        
        <p className="form-switch">
          アカウントをお持ちでない方は <Link to="/register">登録</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
