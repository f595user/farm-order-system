/**
 * Debug Authentication Script
 * 
 * This script adds direct event listeners to authentication buttons
 * and provides additional debugging functionality for authentication issues.
 * It should only be included in development environments.
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

  // Add debug information to the page
  const addDebugInfo = () => {
    // Create debug panel if it doesn't exist
    let debugPanel = document.getElementById('auth-debug-panel');
    if (!debugPanel) {
      debugPanel = document.createElement('div');
      debugPanel.id = 'auth-debug-panel';
      debugPanel.style.position = 'fixed';
      debugPanel.style.bottom = '10px';
      debugPanel.style.right = '10px';
      debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      debugPanel.style.color = '#fff';
      debugPanel.style.padding = '10px';
      debugPanel.style.borderRadius = '5px';
      debugPanel.style.maxWidth = '400px';
      debugPanel.style.maxHeight = '300px';
      debugPanel.style.overflow = 'auto';
      debugPanel.style.zIndex = '9999';
      debugPanel.style.fontSize = '12px';
      debugPanel.style.fontFamily = 'monospace';
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.style.marginBottom = '10px';
      closeBtn.addEventListener('click', () => {
        debugPanel.style.display = 'none';
      });
      debugPanel.appendChild(closeBtn);
      
      document.body.appendChild(debugPanel);
    }
    
    // Clear previous content
    while (debugPanel.childNodes.length > 1) {
      debugPanel.removeChild(debugPanel.lastChild);
    }
    
    // Add auth state information
    const addInfo = (label, value) => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${label}:</strong> ${value}`;
      debugPanel.appendChild(div);
    };
    
    // Check if Auth is available
    if (typeof Auth !== 'undefined') {
      addInfo('Auth Module', 'Available');
      addInfo('Initialized', Auth._initialized);
      addInfo('Authenticated', Auth.isAuthenticated());
      
      if (Auth.currentUser) {
        addInfo('User ID', Auth.currentUser.id);
        addInfo('User Name', Auth.currentUser.name);
        addInfo('User Email', Auth.currentUser.email);
        addInfo('User Role', Auth.currentUser.role);
      } else {
        addInfo('Current User', 'None');
      }
      
      // Add token info if available
      const token = Auth.getToken ? Auth.getToken() : null;
      if (token) {
        addInfo('Token', token.substring(0, 20) + '...');
        
        // Parse token if possible
        if (Auth.parseJwt && Auth.isTokenExpired) {
          const payload = Auth.parseJwt(token);
          if (payload) {
            addInfo('Token Payload', JSON.stringify(payload).substring(0, 100) + '...');
            addInfo('Token Expired', Auth.isTokenExpired(token));
            
            if (payload.exp) {
              const expDate = new Date(payload.exp * 1000);
              addInfo('Token Expiration', expDate.toLocaleString());
            }
          }
        }
      } else {
        addInfo('Token', 'None');
      }
    } else {
      addInfo('Auth Module', 'Not Available');
    }
    
    // Add cookies information
    addInfo('Cookies', document.cookie || 'None');
    
    // Show the panel
    debugPanel.style.display = 'block';
  };
  
  // Add keyboard shortcut (Ctrl+Shift+A) to show debug info
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      addDebugInfo();
    }
  });
  
  console.log('Debug Auth script initialization complete');
});
