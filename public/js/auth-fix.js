/**
 * Authentication Fix for Google Sign-out Issue
 * 
 * This script fixes the issue where signing out after Google authentication
 * causes the page to get stuck on a "loading" screen.
 */

(function() {
  console.log('[Auth Fix] Script loaded');

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Auth Fix] DOM loaded, applying fixes');

    // Wait for Auth module to be available
    const waitForAuth = setInterval(() => {
      if (typeof window.Auth !== 'undefined') {
        clearInterval(waitForAuth);
        applyAuthFixes();
      }
    }, 100);

    function applyAuthFixes() {
      console.log('[Auth Fix] Auth module found, applying fixes');

      // Store the original logout method
      const originalLogout = Auth.logout;

      // Override the logout method to ensure proper cleanup
      Auth.logout = async function() {
        console.log('[Auth Fix] Enhanced logout called');
        
        try {
          // Set a flag to indicate we're in the logout process
          window.isLoggingOut = true;
          
          // Call the original logout method
          await originalLogout.call(this);
          
          console.log('[Auth Fix] Original logout completed successfully');
          
          // Ensure loading state is reset
          if (typeof Auth.updateAuthUI === 'function') {
            console.log('[Auth Fix] Explicitly updating UI with null user');
            Auth.updateAuthUI(null);
          }
          
          // Reset any loading indicators
          const loadingElements = document.querySelectorAll('.loading, .spinner, .loader');
          if (loadingElements && loadingElements.length > 0) {
            console.log(`[Auth Fix] Hiding ${loadingElements.length} loading elements`);
            loadingElements.forEach(el => {
              el.style.display = 'none';
            });
          }
          
          // Clear any auth-related data from storage
          console.log('[Auth Fix] Clearing auth data from storage');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          
          // Clear auth-related cookies
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Force reload the page to ensure a clean state
          console.log('[Auth Fix] Reloading page to ensure clean state');
          setTimeout(() => {
            window.isLoggingOut = false;
            window.location.href = '/';
          }, 100);
          
        } catch (error) {
          console.error('[Auth Fix] Logout error:', error);
          window.isLoggingOut = false;
          
          // Still try to reset UI and reload on error
          if (typeof Auth.updateAuthUI === 'function') {
            Auth.updateAuthUI(null);
          }
          
          alert(`ログアウトに失敗しました: ${error.message}`);
          
          // Force reload even on error
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }
      };

      // Also fix the AuthService.logout method to ensure it properly cleans up
      if (typeof window.AuthService !== 'undefined') {
        const originalServiceLogout = AuthService.logout;
        
        AuthService.logout = async function() {
          console.log('[Auth Fix] Enhanced AuthService.logout called');
          
          try {
            // Call the original method
            const result = await originalServiceLogout.call(this);
            
            // Ensure currentUser is null
            this.currentUser = null;
            
            return result;
          } catch (error) {
            console.error('[Auth Fix] AuthService logout error:', error);
            
            // Still reset currentUser even on error
            this.currentUser = null;
            
            throw error;
          }
        };
      }

      // Add a global error handler for auth-related operations
      window.addEventListener('error', function(event) {
        console.error('[Auth Fix] Global error:', event.error);
        
        // If we're in the logout process and encounter an error, force reload
        if (window.isLoggingOut) {
          console.log('[Auth Fix] Error during logout, forcing page reload');
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }
      });

      console.log('[Auth Fix] All fixes applied successfully');
    }
  });
})();
