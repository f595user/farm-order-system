import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleLogout = () => {
  const { setCurrentUser } = useAuth();
  const [logoutStatus, setLogoutStatus] = useState('初期化中...');
  const [logoutCompleted, setLogoutCompleted] = useState(false);

  useEffect(() => {
    // タイムアウト処理用のタイマーを設定
    const timeoutId = setTimeout(() => {
      console.log('Logout timeout triggered, forcing completion');
      setLogoutStatus('タイムアウトのため、強制的にログアウト処理を完了します。');
      setLogoutCompleted(true);
    }, 5000); // 5秒後にタイムアウト

    const performLogout = async () => {
      try {
        setLogoutStatus('ログアウト処理を開始しています...');
        
        // ユーザー情報のリセット
        setCurrentUser(null);
        
        // 認証関連のローカルストレージキーの削除（必要なキーのみ）
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
        
        // サーバーサイドのセッションをクリアするためにAPIを呼び出す
        // AbortControllerを使用してタイムアウト処理を実装
        try {
          const controller = new AbortController();
          const { signal } = controller;
          
          // 3秒後にリクエストをキャンセル
          const apiTimeoutId = setTimeout(() => {
            controller.abort();
          }, 3000);
          
          // キャッシュを防ぐためにタイムスタンプを追加
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/users/logout?t=${timestamp}`, {
            credentials: 'include',
            signal,
            cache: 'no-store' // キャッシュを使用しない
          });
          
          clearTimeout(apiTimeoutId);
          
          if (!response.ok) {
            console.error('Server logout failed:', response.status);
          } else {
            console.log('Server logout successful');
          }
        } catch (apiError) {
          // AbortErrorの場合はタイムアウトとして処理
          if (apiError.name === 'AbortError') {
            console.log('API logout request timed out, continuing with client-side logout');
          } else {
            console.error('API call error during logout:', apiError);
          }
        }
        
        setLogoutStatus('ログアウト完了。');
        
        // 少し待ってからホームページに遷移
        setTimeout(() => {
          setLogoutCompleted(true);
        }, 500);
      } catch (error) {
        console.error('Logout error:', error);
        setLogoutStatus('エラーが発生しました。');
        
        // エラーが発生しても、ホームページに遷移
        setTimeout(() => {
          setLogoutCompleted(true);
        }, 500);
      } finally {
        // タイムアウトタイマーをクリア
        clearTimeout(timeoutId);
      }
    };

    performLogout();

    // クリーンアップ関数
    return () => {
      clearTimeout(timeoutId);
    };
  }, [setCurrentUser]);

  // ログアウト完了後は、ホームページコンポーネントを返す
  if (logoutCompleted) {
    return <Navigate to="/" />;
  }

  return (
    <div className="google-logout-container">
      <h2>ログアウト処理中</h2>
      <p>{logoutStatus}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="btn btn-primary"
        style={{ marginTop: '20px' }}
      >
        ページ更新
      </button>
    </div>
  );
};

export default GoogleLogout;
