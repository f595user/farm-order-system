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

export default AuthUtils;
