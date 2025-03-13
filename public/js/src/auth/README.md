# Authentication Module

This directory contains the authentication module for the Farm Order System. It provides a comprehensive solution for user authentication, session management, and UI updates based on authentication state.

## File Structure

- `index.js` - Main entry point for the authentication module
- `auth.js` - Main authentication module that combines service, UI, and utilities
- `auth-service.js` - Service for handling API calls and authentication state
- `auth-ui.js` - UI-related functionality for authentication
- `auth-utils.js` - Utility functions for authentication

## Usage

### ES Modules (Recommended)

```javascript
// Import the entire auth module
import Auth from './src/auth/index.js';

// Or import specific components
import { Auth, AuthService, AuthUI, AuthUtils } from './src/auth/index.js';

// The module is automatically initialized when imported
// You can also manually initialize it
Auth.init().then(() => {
  console.log('Auth module initialized');
});

// Check if user is authenticated
if (Auth.isAuthenticated()) {
  console.log('User is authenticated');
}

// Show login modal
Auth.showLoginModal();
```

### Non-Module Environment

For non-module environments, use the compiled version:

```html
<!-- Include the API module first -->
<script src="js/api.js"></script>

<!-- Then include the auth module -->
<script src="js/auth-module.js"></script>

<script>
  // The module is automatically initialized
  // You can also manually initialize it
  Auth.init().then(() => {
    console.log('Auth module initialized');
  });

  // Check if user is authenticated
  if (Auth.isAuthenticated()) {
    console.log('User is authenticated');
  }

  // Show login modal
  Auth.showLoginModal();
</script>
```

## API Reference

### Auth

The main authentication module that combines service, UI, and utilities.

- `Auth.init()` - Initialize the authentication module
- `Auth.getCurrentUser()` - Get the current user data
- `Auth.updateAuthUI(user)` - Update UI based on authentication state
- `Auth.showLoginModal()` - Show the login modal
- `Auth.showRegisterModal()` - Show the register modal
- `Auth.googleLogin()` - Login with Google
- `Auth.login(credentials)` - Login with credentials
- `Auth.register(userData)` - Register a new user
- `Auth.logout()` - Logout the current user
- `Auth.isAuthenticated()` - Check if user is authenticated
- `Auth.isAdmin()` - Check if user is admin
- `Auth.getUserId()` - Get the current user ID

### AuthService

Service for handling API calls and authentication state.

- `AuthService.getCurrentUser()` - Get the current user data
- `AuthService.login(credentials)` - Login with credentials
- `AuthService.register(userData)` - Register a new user
- `AuthService.googleLogin()` - Login with Google
- `AuthService.logout()` - Logout the current user
- `AuthService.isAuthenticated()` - Check if user is authenticated
- `AuthService.isAdmin()` - Check if user is admin
- `AuthService.getUserId()` - Get the current user ID

### AuthUI

UI-related functionality for authentication.

- `AuthUI.init()` - Initialize the authentication UI
- `AuthUI.updateAuthUI(user)` - Update UI based on authentication state
- `AuthUI.setupEventListeners()` - Set up event listeners for authentication
- `AuthUI.showLoginModal()` - Show the login modal
- `AuthUI.showRegisterModal()` - Show the register modal
- `AuthUI.login()` - Login with form data
- `AuthUI.register()` - Register with form data
- `AuthUI.logout()` - Logout the current user

### AuthUtils

Utility functions for authentication.

- `AuthUtils.getCookie(name)` - Get a cookie by name
- `AuthUtils.setCookie(name, value, days)` - Set a cookie
- `AuthUtils.deleteCookie(name)` - Delete a cookie
- `AuthUtils.parseJwt(token)` - Parse JWT token
- `AuthUtils.isTokenExpired(token)` - Check if token is expired
- `AuthUtils.getToken()` - Get token from cookie or localStorage
- `AuthUtils.saveToken(token, days)` - Save token to cookie and localStorage
- `AuthUtils.removeToken()` - Remove token from cookie and localStorage

## Backward Compatibility

For backward compatibility, the `Auth` and `AuthShared` objects are made available globally. This ensures that existing code that uses these objects will continue to work.

```javascript
// These will work in both module and non-module environments
window.Auth.showLoginModal();
window.AuthShared.isAuthenticated();
