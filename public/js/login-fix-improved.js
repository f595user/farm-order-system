/**
 * Enhanced Login Fix - Version 3.0 (Debug)
 * 
 * This script fixes authentication initialization issues:
 * 1. Adds proper module definitions for missing modules (OrdersModule)
 * 2. Adds robust null checks for DOM elements in setupEventListeners
 * 3. Fixes the timing of Auth initialization to ensure proper session handling
 * 4. Adds extensive debugging to identify persistent issues
 */

// Immediately log that this script has loaded
console.log('[Login Fix DEBUG] login-fix-improved.js loaded at', new Date().toISOString());

// Create a self-executing function to avoid polluting the global scope
(function() {
  // Add version timestamp to help identify if the file is being cached
  const VERSION = '3.0-' + new Date().getTime();
  console.log('[Login Fix DEBUG] Version:', VERSION);
  
  // Debug helper to inspect objects deeply
  const debugInspect = (label, obj) => {
    console.log(`[Login Fix DEBUG] ${label}:`, obj);
    if (obj) {
      console.log(`[Login Fix DEBUG] ${label} type:`, typeof obj);
      if (typeof obj === 'object') {
        console.log(`[Login Fix DEBUG] ${label} keys:`, Object.keys(obj));
        console.log(`[Login Fix DEBUG] ${label} methods:`, 
          Object.getOwnPropertyNames(obj).filter(prop => typeof obj[prop] === 'function'));
      }
    }
  };
  
  // Debug helper to log the call stack
  const logCallStack = (label) => {
    try {
      throw new Error(`[Login Fix DEBUG] ${label} call stack`);
    } catch (e) {
      console.log(e.stack);
    }
  };
  
  // Check for existing OrdersModule before we define our own
  debugInspect('Initial OrdersModule state', window.OrdersModule);
  
  // ===== STEP 1: Define missing modules with EXTENSIVE properties =====
  
  // Define OrdersModule if it doesn't exist (needed by auth.js)
  // This must be done BEFORE auth.js is initialized
  if (typeof window.OrdersModule === 'undefined') {
    console.log('[Login Fix DEBUG] Creating OrdersModule definition');
    
    // Create a more comprehensive OrdersModule with all possible methods
    window.OrdersModule = {
      orders: [],
      
      loadOrders: function() {
        console.log('[Login Fix DEBUG] OrdersModule.loadOrders called (placeholder)');
        logCallStack('OrdersModule.loadOrders');
        return Promise.resolve([]);
      },
      
      init: function() {
        console.log('[Login Fix DEBUG] OrdersModule.init called (placeholder)');
        logCallStack('OrdersModule.init');
        return Promise.resolve();
      },
      
      // Add any other methods that might be called
      getOrders: function() {
        console.log('[Login Fix DEBUG] OrdersModule.getOrders called (placeholder)');
        logCallStack('OrdersModule.getOrders');
        return [];
      },
      
      getOrderById: function(id) {
        console.log('[Login Fix DEBUG] OrdersModule.getOrderById called with:', id);
        logCallStack('OrdersModule.getOrderById');
        return null;
      },
      
      renderOrders: function() {
        console.log('[Login Fix DEBUG] OrdersModule.renderOrders called (placeholder)');
        logCallStack('OrdersModule.renderOrders');
      },
      
      // Add any other methods that might be needed
      setupEventListeners: function() {
        console.log('[Login Fix DEBUG] OrdersModule.setupEventListeners called (placeholder)');
        logCallStack('OrdersModule.setupEventListeners');
      }
    };
    
    // Log the created module
    debugInspect('Created OrdersModule', window.OrdersModule);
  } else {
    console.log('[Login Fix DEBUG] OrdersModule already exists, not creating placeholder');
    debugInspect('Existing OrdersModule', window.OrdersModule);
  }
  
  // Define OrderPageModule if it doesn't exist (might be needed by auth.js)
  if (typeof window.OrderPageModule === 'undefined' && window.location.pathname.includes('order.html')) {
    console.log('[Login Fix DEBUG] On order.html but OrderPageModule not defined yet, creating placeholder');
    
    window.OrderPageModule = {
      prefillAddressIfLoggedIn: function() {
        console.log('[Login Fix DEBUG] OrderPageModule.prefillAddressIfLoggedIn called (placeholder)');
        logCallStack('OrderPageModule.prefillAddressIfLoggedIn');
      }
    };
    
    debugInspect('Created OrderPageModule placeholder', window.OrderPageModule);
  }
  
  // ===== STEP 2: Monitor script loading order =====
  
  // Check what scripts are loaded
  const checkLoadedScripts = () => {
    const scripts = document.querySelectorAll('script');
    console.log(`[Login Fix DEBUG] ${scripts.length} scripts loaded on page`);
    
    scripts.forEach((script, index) => {
      if (script.src) {
        console.log(`[Login Fix DEBUG] Script ${index + 1}: ${script.src}`);
      } else {
        console.log(`[Login Fix DEBUG] Script ${index + 1}: inline script`);
      }
    });
    
    // Check specific scripts
    const authScript = Array.from(scripts).find(s => s.src && s.src.includes('auth.js'));
    const orderScript = Array.from(scripts).find(s => s.src && s.src.includes('order.js'));
    const ordersScript = Array.from(scripts).find(s => s.src && s.src.includes('orders.js'));
    const fixScript = Array.from(scripts).find(s => s.src && s.src.includes('login-fix-improved.js'));
    
    console.log('[Login Fix DEBUG] Auth script loaded:', !!authScript);
    console.log('[Login Fix DEBUG] Order script loaded:', !!orderScript);
    console.log('[Login Fix DEBUG] Orders script loaded:', !!ordersScript);
    console.log('[Login Fix DEBUG] Fix script loaded:', !!fixScript);
    
    // Check loading order
    if (authScript && fixScript) {
      const authIndex = Array.from(scripts).indexOf(authScript);
      const fixIndex = Array.from(scripts).indexOf(fixScript);
      
      if (fixIndex < authIndex) {
        console.log('[Login Fix DEBUG] CORRECT: Fix script loaded BEFORE auth script');
      } else {
        console.error('[Login Fix DEBUG] ERROR: Fix script loaded AFTER auth script!');
      }
    }
  };
  
  // Run script check immediately
  checkLoadedScripts();
  
  // ===== STEP 3: Check for Auth module and monitor its state =====
  
  // Check Auth module state periodically
  const checkAuthModule = () => {
    console.log('[Login Fix DEBUG] Checking Auth module state');
    
    if (typeof window.Auth === 'undefined') {
      console.log('[Login Fix DEBUG] Auth module not defined yet');
      return false;
    }
    
    debugInspect('Auth module', window.Auth);
    console.log('[Login Fix DEBUG] Auth._initialized:', window.Auth._initialized);
    console.log('[Login Fix DEBUG] Auth.currentUser:', window.Auth.currentUser);
    
    return true;
  };
  
  // Check Auth module immediately
  checkAuthModule();
  
  // Schedule periodic checks
  const authCheckInterval = setInterval(() => {
    if (checkAuthModule()) {
      console.log('[Login Fix DEBUG] Auth module found, clearing check interval');
      clearInterval(authCheckInterval);
    }
  }, 500);
  
  // ===== STEP 4: Fix Auth module initialization =====
  
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Login Fix DEBUG] DOM fully loaded at', new Date().toISOString());
    
    // Check loaded scripts again after DOM is ready
    checkLoadedScripts();
    
    // Check Auth module again
    checkAuthModule();
    
    // Check if Auth module exists
    if (typeof window.Auth === 'undefined') {
      console.error('[Login Fix DEBUG] Auth module not found! Cannot apply fixes.');
      return;
    }
    
    console.log('[Login Fix DEBUG] Auth module found, applying fixes');
    
    // ===== STEP 5: Fix Auth.updateAuthUI method =====
    
    // Store original methods before overriding
    const originalUpdateAuthUI = Auth.updateAuthUI;
    
    // Override updateAuthUI to add proper module checks
    Auth.updateAuthUI = function(user) {
      try {
        console.log('[Login Fix DEBUG] Running enhanced updateAuthUI', user ? 'with user' : 'without user');
        logCallStack('Auth.updateAuthUI');
        
        if (user) {
          debugInspect('User object in updateAuthUI', user);
        }
        
        // Call original method with proper this context and arguments
        console.log('[Login Fix DEBUG] Calling original updateAuthUI method');
        originalUpdateAuthUI.call(this, user);
        console.log('[Login Fix DEBUG] Original updateAuthUI completed');
        
        // Only proceed with user-specific operations if user is authenticated
        if (user) {
          console.log('[Login Fix DEBUG] User is authenticated:', user.name);
          
          // Check if we're on the orders page (index.html)
          const isOrdersPage = document.querySelector('.orders-list') !== null;
          console.log('[Login Fix DEBUG] On orders page:', isOrdersPage);
          
          if (isOrdersPage) {
            console.log('[Login Fix DEBUG] On orders page, checking OrdersModule');
            debugInspect('Current OrdersModule state', window.OrdersModule);
            
            // Safely call OrdersModule.loadOrders if it exists
            if (typeof window.OrdersModule !== 'undefined' && typeof window.OrdersModule.loadOrders === 'function') {
              console.log('[Login Fix DEBUG] Calling OrdersModule.loadOrders()');
              
              try {
                window.OrdersModule.loadOrders().catch(err => {
                  console.warn('[Login Fix DEBUG] Error loading orders:', err);
                });
                console.log('[Login Fix DEBUG] OrdersModule.loadOrders() call completed');
              } catch (error) {
                console.error('[Login Fix DEBUG] Exception calling OrdersModule.loadOrders():', error);
              }
            } else {
              console.error('[Login Fix DEBUG] OrdersModule or loadOrders method not found!');
              debugInspect('Current window.OrdersModule', window.OrdersModule);
            }
          }
          
          // Check if we're on the order page (order.html)
          const isOrderPage = document.getElementById('order-page') !== null;
          console.log('[Login Fix DEBUG] On order page:', isOrderPage);
          
          if (isOrderPage) {
            console.log('[Login Fix DEBUG] On order page, checking for OrderPageModule');
            debugInspect('Current OrderPageModule state', window.OrderPageModule);
            
            // Use a longer timeout to ensure OrderPageModule is fully initialized
            setTimeout(() => {
              console.log('[Login Fix DEBUG] OrderPageModule timeout callback executing');
              debugInspect('OrderPageModule after timeout', window.OrderPageModule);
              
              if (typeof window.OrderPageModule !== 'undefined' && typeof window.OrderPageModule.prefillAddressIfLoggedIn === 'function') {
                try {
                  console.log('[Login Fix DEBUG] Calling OrderPageModule.prefillAddressIfLoggedIn()');
                  window.OrderPageModule.prefillAddressIfLoggedIn();
                  console.log('[Login Fix DEBUG] prefillAddressIfLoggedIn completed');
                } catch (error) {
                  console.error('[Login Fix DEBUG] Error pre-filling address:', error);
                  console.error(error.stack);
                }
              } else {
                console.error('[Login Fix DEBUG] OrderPageModule or prefillAddressIfLoggedIn not available');
                debugInspect('Current window.OrderPageModule', window.OrderPageModule);
              }
            }, 500); // Increased timeout for better reliability
          }
        } else {
          console.log('[Login Fix DEBUG] User is not authenticated');
        }
      } catch (error) {
        console.error('[Login Fix DEBUG] Error in enhanced updateAuthUI:', error);
        console.error(error.stack);
        // Don't rethrow the error - we want to continue even if there's an error
      }
    };
    
    // ===== STEP 6: Fix AuthUI.loadUserData method =====
    
    // Only proceed if AuthUI is defined
    if (typeof window.AuthUI !== 'undefined') {
      console.log('[Login Fix DEBUG] AuthUI found, applying fixes');
      debugInspect('AuthUI object', window.AuthUI);
      
      // Store original methods
      const originalLoadUserData = AuthUI.loadUserData;
      
      // Override loadUserData to add proper error handling
      AuthUI.loadUserData = function(user) {
        try {
          console.log('[Login Fix DEBUG] Running enhanced loadUserData');
          logCallStack('AuthUI.loadUserData');
          
          if (!user) {
            console.warn('[Login Fix DEBUG] loadUserData called with null/undefined user');
            return;
          }
          
          debugInspect('User object in loadUserData', user);
          
          // IMPORTANT: Check for OrdersModule reference in the original code
          console.log('[Login Fix DEBUG] Checking if original loadUserData contains OrdersModule reference');
          const originalFnStr = originalLoadUserData.toString();
          if (originalFnStr.includes('OrdersModule')) {
            console.error('[Login Fix DEBUG] CRITICAL: Original loadUserData contains OrdersModule reference!');
            console.log('[Login Fix DEBUG] Original function:', originalFnStr);
          }
          
          // Load user profile data if elements exist
          const nameInput = document.getElementById('name');
          const emailInput = document.getElementById('email');
          
          console.log('[Login Fix DEBUG] Name input exists:', !!nameInput);
          console.log('[Login Fix DEBUG] Email input exists:', !!emailInput);
          
          if (nameInput && emailInput) {
            console.log('[Login Fix DEBUG] Setting name and email inputs');
            nameInput.value = user.name || '';
            emailInput.value = user.email || '';
          } else {
            console.log('[Login Fix DEBUG] Name/email inputs not found, skipping');
          }
          
          // Load user addresses if available
          if (user.addresses) {
            console.log('[Login Fix DEBUG] User has addresses, loading them');
            debugInspect('User addresses', user.addresses);
            
            // Only call loadAddresses if it exists
            if (typeof this.loadAddresses === 'function') {
              console.log('[Login Fix DEBUG] Calling loadAddresses method');
              try {
                this.loadAddresses(user.addresses);
                console.log('[Login Fix DEBUG] loadAddresses completed');
              } catch (error) {
                console.error('[Login Fix DEBUG] Error in loadAddresses:', error);
              }
            } else {
              console.log('[Login Fix DEBUG] loadAddresses method not found, skipping');
            }
          } else {
            console.log('[Login Fix DEBUG] User has no addresses, skipping');
          }
        } catch (error) {
          console.error('[Login Fix DEBUG] Error in enhanced loadUserData:', error);
          console.error(error.stack);
          // Don't rethrow the error - we want to continue even if there's an error
        }
      };
      
      // ===== STEP 7: Fix AuthUI.setupEventListeners method =====
      
      // Store original method
      const originalSetupEventListeners = AuthUI.setupEventListeners;
      
      // Override setupEventListeners to add robust null checks
      AuthUI.setupEventListeners = function() {
        try {
          console.log('[Login Fix DEBUG] Running enhanced setupEventListeners');
          logCallStack('AuthUI.setupEventListeners');
          
          // Define a helper function to safely add event listeners
          const safeAddEventListener = (selector, event, handler) => {
            const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
            if (element) {
              console.log(`[Login Fix DEBUG] Adding ${event} listener to`, typeof selector === 'string' ? selector : 'element');
              element.addEventListener(event, handler);
              return true;
            } else {
              console.log(`[Login Fix DEBUG] Element not found: ${typeof selector === 'string' ? selector : 'selector'}, skipping`);
              return false;
            }
          };
          
          // Define a helper function for query selector elements
          const safeQuerySelectorAll = (selector, callback) => {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
              console.log(`[Login Fix DEBUG] Found ${elements.length} elements matching "${selector}"`);
              elements.forEach(callback);
              return true;
            } else {
              console.log(`[Login Fix DEBUG] No elements found matching "${selector}", skipping`);
              return false;
            }
          };
          
          // Login button
          safeAddEventListener('login-btn', 'click', () => {
            this.showLoginModal();
          });
          
          // Register button
          safeAddEventListener('register-btn', 'click', () => {
            this.showRegisterModal();
          });
          
          // Logout button
          safeAddEventListener('logout-btn', 'click', () => {
            this.logout();
          });
          
          // Google login button
          safeAddEventListener('google-login-btn', 'click', () => {
            this.googleLogin();
          });
          
          // Login form
          safeAddEventListener('login-form', 'submit', (e) => {
            e.preventDefault();
            this.login();
          });
          
          // Register form
          safeAddEventListener('register-form', 'submit', (e) => {
            e.preventDefault();
            this.register();
          });
          
          // Switch between login and register forms
          safeAddEventListener('switch-to-register', 'click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
          });
          
          safeAddEventListener('switch-to-login', 'click', (e) => {
            e.preventDefault();
            this.showLoginModal();
          });
          
          // Close modals
          safeQuerySelectorAll('.modal .close', closeBtn => {
            closeBtn.addEventListener('click', () => {
              document.querySelectorAll('.modal').forEach(modal => {
                if (modal) {
                  modal.style.display = 'none';
                }
              });
            });
          });
          
          // Login buttons in other sections
          safeQuerySelectorAll('#orders-login-btn, #account-login-btn', btn => {
            btn.addEventListener('click', () => {
              this.showLoginModal();
            });
          });
          
          // Profile form
          safeAddEventListener('profile-form', 'submit', (e) => {
            e.preventDefault();
            this.updateProfile();
          });
          
          // Add address button
          safeAddEventListener('add-address-btn', 'click', () => {
            this.showAddressModal();
          });
          
          // Address form
          safeAddEventListener('address-form', 'submit', (e) => {
            e.preventDefault();
            this.saveAddress();
          });
          
          console.log('[Login Fix DEBUG] Event listeners setup complete');
        } catch (error) {
          console.error('[Login Fix DEBUG] Error setting up event listeners:', error);
        }
      };
      
      // ===== STEP 8: Fix AuthUI.setupAddressEventListeners method =====
      
      // Only override if the method exists
      if (typeof AuthUI.setupAddressEventListeners === 'function') {
        // Store original method
        const originalSetupAddressEventListeners = AuthUI.setupAddressEventListeners;
        
        // Override setupAddressEventListeners to add robust null checks
        AuthUI.setupAddressEventListeners = function() {
          try {
            console.log('[Login Fix DEBUG] Running enhanced setupAddressEventListeners');
            
            // Helper function for address event listeners
            const safeAddAddressListeners = (selector, action) => {
              const buttons = document.querySelectorAll(selector);
              if (buttons && buttons.length > 0) {
                console.log(`[Login Fix DEBUG] Found ${buttons.length} ${action} buttons`);
                buttons.forEach(btn => {
                  btn.addEventListener('click', () => {
                    const addressId = btn.dataset.id;
                    if (addressId) {
                      console.log(`[Login Fix DEBUG] ${action} address ${addressId}`);
                      this[action + 'Address'](addressId);
                    } else {
                      console.warn(`[Login Fix DEBUG] Button missing data-id attribute`);
                    }
                  });
                });
                return true;
              } else {
                console.log(`[Login Fix DEBUG] No ${action} buttons found, skipping`);
                return false;
              }
            };
            
            // Add listeners for each button type
            safeAddAddressListeners('.edit-address-btn', 'edit');
            safeAddAddressListeners('.delete-address-btn', 'delete');
            safeAddAddressListeners('.set-default-btn', 'setDefault');
            
          } catch (error) {
            console.error('[Login Fix DEBUG] Error setting up address event listeners:', error);
          }
        };
      }
    }
    
    // ===== STEP 9: Ensure Auth is properly initialized =====
    
    // Check if Auth is already initialized
    if (Auth._initialized) {
      console.log('[Login Fix DEBUG] Auth was already initialized, re-initializing with fixes');
      // Reset initialization flag
      Auth._initialized = false;
      
      // Re-initialize Auth with proper error handling
      Auth.init().then(() => {
        console.log('[Login Fix DEBUG] Auth re-initialization successful');
        
        // Check if we need to manually trigger authentication state update
        if (Auth.currentUser) {
          console.log('[Login Fix DEBUG] Current user exists, updating UI state');
          Auth.updateAuthUI(Auth.currentUser);
        }
      }).catch(err => {
        console.error('[Login Fix DEBUG] Error re-initializing Auth module:', err);
      });
    } else {
      console.log('[Login Fix DEBUG] Auth not yet initialized, fixes will apply when it initializes');
    }
    
    // ===== STEP 10: Add session persistence check =====
    
    // Check if authentication token exists in storage
    const checkAuthToken = () => {
      const token = localStorage.getItem('auth_token') || 
                   (document.cookie.match(/auth_token=([^;]+)/) || [])[1];
      
      console.log('[Login Fix DEBUG] Auth token check:', token ? 'Token exists' : 'No token found');
      
      if (token && !Auth.currentUser) {
        console.log('[Login Fix DEBUG] Token exists but no current user, attempting to restore session');
        // Try to restore session
        Auth.getCurrentUser().then(user => {
          if (user) {
            console.log('[Login Fix DEBUG] Session restored successfully');
            Auth.updateAuthUI(user);
          } else {
            console.log('[Login Fix DEBUG] Failed to restore session despite token existing');
          }
        }).catch(err => {
          console.error('[Login Fix DEBUG] Error restoring session:', err);
        });
      }
    };
    
    // Run token check after a delay to ensure Auth has had a chance to initialize
    setTimeout(checkAuthToken, 500);
    
    // ===== STEP 11: Check for network requests =====
    
    // Monitor network requests if possible
    if (window.performance && window.performance.getEntries) {
      setTimeout(() => {
        console.log('[Login Fix DEBUG] Checking network requests');
        const resources = window.performance.getEntries();
        const apiRequests = resources.filter(r => r.name.includes('/api/') || r.name.includes('/auth/'));
        
        console.log('[Login Fix DEBUG] API requests:', apiRequests.map(r => ({
          url: r.name,
          duration: r.duration,
          status: r.responseStatus
        })));
      }, 2000);
    }
  });
  
  console.log('[Login Fix DEBUG] Authentication fixes registered, waiting for DOM ready');
})();
