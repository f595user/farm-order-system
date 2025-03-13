/**
 * Login Fix Script
 * This script adds a direct click event handler to the login button
 * to ensure the login functionality works correctly.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Add direct click event handler for login submit button
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if Auth module is available
      if (typeof Auth !== 'undefined' && typeof Auth.login === 'function') {
        Auth.login();
      } else {
        console.error('Auth module not found or login method not available');
        alert('ログイン機能が正しく読み込まれていません。ページを再読み込みしてください。');
      }
    });
  }
  
  // Add direct form submit handler as a backup
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check if Auth module is available
      if (typeof Auth !== 'undefined' && typeof Auth.login === 'function') {
        Auth.login();
      } else {
        console.error('Auth module not found or login method not available');
        alert('ログイン機能が正しく読み込まれていません。ページを再読み込みしてください。');
      }
    });
  }
  
  console.log('Login fix script loaded and initialized');
});
