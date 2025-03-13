/**
 * Authentication Module
 * Main entry point for authentication functionality
 * 
 * This module integrates the authentication service, UI, and utilities
 * to provide a complete authentication experience.
 */
import AuthService from './auth-service.js';
import AuthUI from './auth-ui.js';
import AuthUtils from './auth-utils.js';

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

// Export the Auth module
export default Auth;

// For backward compatibility, make Auth available globally
window.Auth = Auth;
