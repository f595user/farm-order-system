/**
 * Authentication Module Index
 * Main entry point for the authentication module
 * 
 * This file exports all authentication-related functionality
 * and provides backward compatibility with the global Auth object.
 */
import Auth from './auth.js';
import AuthService from './auth-service.js';
import AuthUI from './auth-ui.js';
import AuthUtils from './auth-utils.js';

// Initialize Auth module when this file is imported
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Auth module from index.js');
  Auth.init().catch(err => console.error('Error initializing Auth module:', err));
});

// Export all auth modules
export {
  Auth as default,
  AuthService,
  AuthUI,
  AuthUtils
};

// For backward compatibility, make Auth and AuthShared available globally
window.Auth = Auth;
window.AuthShared = Auth;
