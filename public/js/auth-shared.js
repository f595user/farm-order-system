/**
 * Shared Authentication Module
 * This module provides a consistent authentication experience across all pages
 * by ensuring proper session handling and initialization.
 */
const AuthShared = {
  /**
   * Current user data
   */
  currentUser: null,

  /**
   * Flag to track initialization
   */
  _initialized: false,

  /**
   * Initialize authentication
   * Check if user is logged in and update UI
   */
  async init() {
    try {
      console.log('Initializing AuthShared module');
      
      if (this._initialized) {
        console.log('AuthShared already initialized, skipping');
        return;
      }
      
      // Try to get current user from session
      const user = await this.getCurrentUser();
      this.updateAuthUI(user);
      
      // Set up event listeners
      this.setupEventListeners();
      
      this._initialized = true;
      console.log('AuthShared initialization complete');
    } catch (error) {
      console.error('AuthShared initialization error:', error);
      this.updateAuthUI(null);
    }
  },

  /**
   * Get current user from session
   * @returns {Promise} - Promise with user data or null if not authenticated
   */
  async getCurrentUser() {
    try {
      console.log('Fetching current user from session');
      const userData = await API.auth.getCurrentUser();
      console.log('Current user data received:', userData ? 'User authenticated' : 'No user data');
      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error.message);
      this.currentUser = null;
      
      // If it's a 401 error, just return null instead of throwing
      if (error.message && error.message.includes('401')) {
        console.log('User is not authenticated, returning null');
        return null;
      }
      
      throw error;
    }
  },

  /**
   * Update UI based on authentication state
   * @param {Object|null} user - User data or null if not logged in
   */
  updateAuthUI(user) {
    try {
      const authButtons = document.querySelector('.auth-buttons');
      const userProfile = document.querySelector('.user-profile');
      const adminLink = document.querySelector('.admin-link');
      const userName = document.querySelector('.user-name');
      
      if (user) {
        // User is logged in
        if (authButtons) authButtons.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userName) userName.textContent = user.name || '';
        
        // Show admin link if user is admin
        if (adminLink) {
          if (user.role === 'admin') {
            adminLink.classList.remove('hidden');
          } else {
            adminLink.classList.add('hidden');
          }
        }
        
        // Update authenticated sections
        const authRequiredMessages = document.querySelectorAll('.auth-required-message');
        if (authRequiredMessages && authRequiredMessages.length > 0) {
          authRequiredMessages.forEach(el => {
            el.classList.add('hidden');
          });
        }
        
        const authenticatedSections = document.querySelectorAll('.orders-list, .account-details');
        if (authenticatedSections && authenticatedSections.length > 0) {
          authenticatedSections.forEach(el => {
            el.classList.remove('hidden');
          });
        }
        
        // Load user-specific data if on the appropriate page
        if (typeof OrdersModule !== 'undefined' && typeof OrdersModule.loadOrders === 'function') {
          OrdersModule.loadOrders();
        }
        
        // Pre-fill address if on order page
        // Wrap in setTimeout with a longer delay to ensure OrderPageModule is fully initialized
        setTimeout(() => {
          if (typeof OrderPageModule !== 'undefined' && typeof OrderPageModule.prefillAddressIfLoggedIn === 'function') {
            try {
              OrderPageModule.prefillAddressIfLoggedIn();
            } catch (error) {
              console.warn('Error pre-filling address:', error);
            }
          }
        }, 100); // Increased delay to ensure DOM is ready
      } else {
        // User is not logged in
        if (authButtons) authButtons.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
        
        // Hide authenticated sections
        const authRequiredMessages = document.querySelectorAll('.auth-required-message');
        if (authRequiredMessages && authRequiredMessages.length > 0) {
          authRequiredMessages.forEach(el => {
            el.classList.remove('hidden');
          });
        }
        
        const authenticatedSections = document.querySelectorAll('.orders-list, .account-details');
        if (authenticatedSections && authenticatedSections.length > 0) {
          authenticatedSections.forEach(el => {
            el.classList.add('hidden');
          });
        }
      }
    } catch (error) {
      console.error('Error updating auth UI:', error);
    }
  },

  /**
   * Set up event listeners for authentication
   */
  setupEventListeners() {
    try {
      // Login button
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          this.showLoginModal();
        });
      }
      
      // Register button
      const registerBtn = document.getElementById('register-btn');
      if (registerBtn) {
        registerBtn.addEventListener('click', () => {
          this.showRegisterModal();
        });
      }
      
      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.logout();
        });
      }
      
      // Google login button
      const googleLoginBtn = document.getElementById('google-login-btn');
      if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
          this.googleLogin();
        });
      }
      
      // Login form
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.login();
        });
      }
      
      // Register form
      const registerForm = document.getElementById('register-form');
      if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.register();
        });
      }
      
      // Switch between login and register forms
      const switchToRegister = document.getElementById('switch-to-register');
      if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
          e.preventDefault();
          this.showRegisterModal();
        });
      }
      
      const switchToLogin = document.getElementById('switch-to-login');
      if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
          e.preventDefault();
          this.showLoginModal();
        });
      }
      
      // Close modals
      const closeButtons = document.querySelectorAll('.modal .close');
      if (closeButtons && closeButtons.length > 0) {
        closeButtons.forEach(closeBtn => {
          closeBtn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
              if (modal) {
                modal.style.display = 'none';
              }
            });
          });
        });
      }
      
      // Login buttons in other sections
      const loginButtons = document.querySelectorAll('#orders-login-btn, #account-login-btn');
      if (loginButtons && loginButtons.length > 0) {
        loginButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            this.showLoginModal();
          });
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  },

  /**
   * Show login modal
   */
  showLoginModal() {
    try {
      console.log('showLoginModal called');
      const registerModal = document.getElementById('register-modal');
      const loginModal = document.getElementById('login-modal');
      const loginEmail = document.getElementById('login-email');
      
      console.log('Login modal element:', loginModal);
      
      if (registerModal) registerModal.style.display = 'none';
      if (loginModal) {
        loginModal.style.display = 'block';
        console.log('Login modal display set to block');
      } else {
        console.error('Login modal element not found');
      }
      if (loginEmail) loginEmail.focus();
    } catch (error) {
      console.error('Error showing login modal:', error);
    }
  },

  /**
   * Show register modal
   */
  showRegisterModal() {
    try {
      const loginModal = document.getElementById('login-modal');
      const registerModal = document.getElementById('register-modal');
      const registerName = document.getElementById('register-name');
      
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'block';
      if (registerName) registerName.focus();
    } catch (error) {
      console.error('Error showing register modal:', error);
    }
  },

  /**
   * Login with Google
   */
  googleLogin() {
    API.auth.googleLogin();
  },

  /**
   * Login user
   */
  async login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください。');
      return;
    }
    
    try {
      const response = await API.auth.login({ email, password });
      this.currentUser = response.user;
      
      // Close modal
      document.getElementById('login-modal').style.display = 'none';
      
      // Update UI
      this.updateAuthUI(this.currentUser);
      
      // Show success message
      alert('ログインしました。');
    } catch (error) {
      alert(`ログインに失敗しました: ${error.message}`);
    }
  },

  /**
   * Register new user
   */
  async register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    
    if (!name || !email || !password || !passwordConfirm) {
      alert('すべての項目を入力してください。');
      return;
    }
    
    if (password !== passwordConfirm) {
      alert('パスワードが一致しません。');
      return;
    }
    
    try {
      await API.auth.register({ name, email, password });
      
      // Close modal
      document.getElementById('register-modal').style.display = 'none';
      
      // Show success message and open login modal
      alert('登録が完了しました。ログインしてください。');
      this.showLoginModal();
    } catch (error) {
      alert(`登録に失敗しました: ${error.message}`);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await API.auth.logout();
      this.currentUser = null;
      
      // Update UI
      this.updateAuthUI(null);
      
      // Navigate to home if App is available
      if (typeof App !== 'undefined' && typeof App.showTab === 'function') {
        App.showTab('home');
      } else {
        // Otherwise redirect to home page
        window.location.href = '/';
      }
      
      // Show success message
      alert('ログアウトしました。');
    } catch (error) {
      alert(`ログアウトに失敗しました: ${error.message}`);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  },

  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },

  /**
   * Get user ID
   * @returns {string|null} - User ID or null if not authenticated
   */
  getUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }
};

// For backward compatibility, make Auth reference AuthShared
// This ensures existing code that uses Auth will continue to work
window.Auth = AuthShared;
