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

export default AuthService;
