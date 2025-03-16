import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !passwordConfirm) {
      setError('すべての項目を入力してください。');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await register({ name, email, password });
      
      // Show success message and redirect to login
      alert('登録が完了しました。ログインしてください。');
      navigate('/login');
    } catch (err) {
      setError(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>アカウント登録</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">名前</label>
            <input 
              type="text" 
              id="register-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-email">メールアドレス</label>
            <input 
              type="email" 
              id="register-email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-password">パスワード</label>
            <input 
              type="password" 
              id="register-password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-password-confirm">パスワード（確認）</label>
            <input 
              type="password" 
              id="register-password-confirm" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        
        <p className="form-switch">
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
