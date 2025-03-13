/**
 * Debug Authentication Script
 * This script adds direct event listeners to authentication buttons
 * to help debug authentication issues.
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Debug Auth script loaded');
  
  // Add direct click event handler for login button
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    console.log('Login button found, adding event listener');
    loginBtn.addEventListener('click', (e) => {
      console.log('Login button clicked');
      
      // Show login modal directly
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        console.log('Login modal found, showing it');
        loginModal.style.display = 'block';
      } else {
        console.error('Login modal not found');
      }
    });
  } else {
    console.error('Login button not found');
  }
  
  // Add direct click event handler for login submit button
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) {
    console.log('Login submit button found, adding event listener');
    loginSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Login submit button clicked');
      
      // Get login form values
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      console.log('Attempting login with email:', email);
      
      // Call API directly
      fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      .then(response => {
        console.log('Login response status:', response.status);
        if (!response.ok) {
          throw new Error(`Login failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Login successful:', data);
        
        // Close modal
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
          loginModal.style.display = 'none';
        }
        
        // Reload page to update UI
        window.location.reload();
      })
      .catch(error => {
        console.error('Login error:', error);
        alert(`ログインに失敗しました: ${error.message}`);
      });
    });
  } else {
    console.error('Login submit button not found');
  }
});
