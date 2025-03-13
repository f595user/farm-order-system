/**
 * Authentication Module (Compiled)
 * This file is a compiled version of the auth module for use in non-module environments.
 * It provides all authentication functionality in a single file.
 */

// Create a self-executing function to avoid polluting the global scope
(function() {
  /**
   * Authentication Service
   * Handles all authentication API calls and token management
   */
  const AuthService = {
    /**
     * Current user data
     */
    currentUser: null,

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
     * Login user
     * @param {Object} credentials - User login credentials (email, password)
     * @returns {Promise} - Promise with login response
     */
    async login(credentials) {
      try {
        const response = await API.auth.login(credentials);
        this.currentUser = response.user;
        return response;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data (name, email, password)
     * @returns {Promise} - Promise with registration response
     */
    async register(userData) {
      try {
        return await API.auth.register(userData);
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    /**
     * Login with Google
     * This will redirect to Google's OAuth page
     */
    googleLogin() {
      API.auth.googleLogin();
    },

    /**
     * Logout user
     * @returns {Promise} - Promise with logout response
     */
    async logout() {
      try {
        await API.auth.logout();
        this.currentUser = null;
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
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

  /**
   * Authentication UI Module
   * Handles all UI-related authentication functionality
   */
  const AuthUI = {
    /**
     * Flag to track initialization
     */
    _initialized: false,

    /**
     * Initialize authentication UI
     * Check if user is logged in and update UI
     */
    async init() {
      try {
        console.log('Initializing AuthUI module');
        
        if (this._initialized) {
          console.log('AuthUI already initialized, skipping');
          return;
        }
        
        // Try to get current user from session
        const user = await AuthService.getCurrentUser();
        this.updateAuthUI(user);
        
        // Set up event listeners
        this.setupEventListeners();
        
        this._initialized = true;
        console.log('AuthUI initialization complete');
      } catch (error) {
        console.error('AuthUI initialization error:', error);
        this.updateAuthUI(null);
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
      AuthService.googleLogin();
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
        const response = await AuthService.login({ email, password });
        
        // Close modal
        document.getElementById('login-modal').style.display = 'none';
        
        // Update UI
        this.updateAuthUI(response.user);
        
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
        await AuthService.register({ name, email, password });
        
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
        await AuthService.logout();
        
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
    }
  };

  /**
   * Authentication Utilities
   * Provides utility functions for authentication
   */
  const AuthUtils = {
    /**
     * Get a cookie by name
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null if not found
     */
    getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    },

    /**
     * Set a cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Cookie expiration in days
     */
    setCookie(name, value, days = 7) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    },

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     */
    deleteCookie(name) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    },

    /**
     * Parse JWT token
     * @param {string} token - JWT token
     * @returns {Object|null} - Parsed token payload or null if invalid
     */
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
      }
    },

    /**
     * Check if token is expired
     * @param {string} token - JWT token
     * @returns {boolean} - True if token is expired
     */
    isTokenExpired(token) {
      const payload = this.parseJwt(token);
      if (!payload || !payload.exp) return true;
      
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    },

    /**
     * Get token from cookie or localStorage
     * @returns {string|null} - Token or null if not found
     */
    getToken() {
      // Try to get token from cookie first
      let token = this.getCookie('auth_token');
      
      // If not in cookie, try localStorage
      if (!token) {
        token = localStorage.getItem('auth_token');
      }
      
      return token;
    },

    /**
     * Save token to cookie and localStorage
     * @param {string} token - JWT token
     * @param {number} days - Cookie expiration in days
     */
    saveToken(token, days = 7) {
      // Save to cookie
      this.setCookie('auth_token', token, days);
      
      // Also save to localStorage as backup
      localStorage.setItem('auth_token', token);
    },

    /**
     * Remove token from cookie and localStorage
     */
    removeToken() {
      // Remove from cookie
      this.deleteCookie('auth_token');
      
      // Remove from localStorage
      localStorage.removeItem('auth_token');
    }
  };

  /**
   * Auth Module
   * Combines service, UI, and utilities into a single interface
   */
  const Auth = {
    /**
     * Flag to track initialization
     */
    _initialized: false,

    /**
     * Initialize authentication
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    async init() {
      try {
        console.log('Initializing Auth module');
        
        if (this._initialized) {
          console.log('Auth already initialized, skipping');
          return;
        }
        
        // Initialize UI
        await AuthUI.init();
        
        this._initialized = true;
        console.log('Auth initialization complete');
      } catch (error) {
        console.error('Auth initialization error:', error);
        throw error;
      }
    },

    /**
     * Get current user
     * @returns {Promise} - Promise with user data
     */
    getCurrentUser() {
      return AuthService.getCurrentUser();
    },

    /**
     * Update UI based on authentication state
     * @param {Object|null} user - User data or null if not logged in
     */
    updateAuthUI(user) {
      AuthUI.updateAuthUI(user);
    },

    /**
     * Show login modal
     */
    showLoginModal() {
      AuthUI.showLoginModal();
    },

    /**
     * Show register modal
     */
    showRegisterModal() {
      AuthUI.showRegisterModal();
    },

    /**
     * Login with Google
     */
    googleLogin() {
      AuthService.googleLogin();
    },

    /**
     * Login user
     * @param {Object} credentials - User login credentials
     * @returns {Promise} - Promise with login response
     */
    async login(credentials) {
      if (!credentials) {
        // If no credentials provided, use UI login
        return AuthUI.login();
      }
      
      try {
        const response = await AuthService.login(credentials);
        AuthUI.updateAuthUI(response.user);
        return response;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - Promise with registration response
     */
    async register(userData) {
      if (!userData) {
        // If no user data provided, use UI register
        return AuthUI.register();
      }
      
      try {
        return await AuthService.register(userData);
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    /**
     * Logout user
     * @returns {Promise} - Promise with logout response
     */
    async logout() {
      try {
        await AuthService.logout();
        AuthUI.updateAuthUI(null);
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if user is authenticated
     */
    isAuthenticated() {
      return AuthService.isAuthenticated();
    },

    /**
     * Check if user is admin
     * @returns {boolean} - True if user is admin
     */
    isAdmin() {
      return AuthService.isAdmin();
    },

    /**
     * Get user ID
     * @returns {string|null} - User ID or null if not authenticated
     */
    getUserId() {
      return AuthService.getUserId();
    },

    /**
     * Get token
     * @returns {string|null} - Token or null if not found
     */
    getToken() {
      return AuthUtils.getToken();
    },

    /**
     * Parse JWT token
     * @param {string} token - JWT token
     * @returns {Object|null} - Parsed token payload or null if invalid
     */
    parseJwt(token) {
      return AuthUtils.parseJwt(token);
    },

    /**
     * Check if token is expired
     * @param {string} token - JWT token
     * @returns {boolean} - True if token is expired
     */
    isTokenExpired(token) {
      return AuthUtils.isTokenExpired(token);
    }
  };

  // Initialize Auth module when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Auth module from auth-module.js');
    Auth.init().catch(err => console.error('Error initializing Auth module:', err));
  });

  // For backward compatibility, make Auth and AuthShared available globally
  window.Auth = Auth;
  window.AuthShared = Auth;
})();
