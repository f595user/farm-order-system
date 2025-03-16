/**
 * Authentication Module
 * 
 * This file provides a comprehensive authentication solution for the Farm Order System.
 * It combines functionality from auth-module.js, auth-shared.js, auth.js, and includes
 * the modular structure from the src/auth directory.
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
        // Check URL for logout parameter
        const urlParams = new URLSearchParams(window.location.search);
        const hasLogout = urlParams.get('logout');
        
        // If logout parameter is present, don't even try to fetch the user
        if (hasLogout) {
          console.log('Logout parameter detected in URL, skipping user fetch');
          this.currentUser = null;
          return null;
        }
        
        console.log('Fetching current user from session');
        
        // Use direct fetch with cache-busting instead of API.auth.getCurrentUser()
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/users/current?t=${timestamp}`, {
          credentials: 'include',
          cache: 'no-store' // Prevent caching
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('User is not authenticated, returning null');
            this.currentUser = null;
            return null;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        const userData = await response.json();
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
        // Reset user state immediately
        this.currentUser = null;
        
        // Clear any auth-related data from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('googleUser');
        localStorage.removeItem('session');
        
        // クライアント側のクッキーをクリア - より徹底的に
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
        
        // Call the logout API with timeout handling
        try {
          // Create a timeout promise that rejects after 3 seconds
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Logout API request timed out'));
            }, 3000);
          });
          
          // キャッシュを防ぐためにタイムスタンプを追加
          const timestamp = new Date().getTime();
          
          // Race between the API call and the timeout
          await Promise.race([
            fetch(`/api/users/logout?t=${timestamp}`, {
              credentials: 'include',
              cache: 'no-store' // キャッシュを使用しない
            }),
            timeoutPromise
          ]);
          
          console.log('Server-side logout completed successfully');
        } catch (apiError) {
          console.warn('Logout API error or timeout:', apiError.message);
          console.log('Continuing with client-side logout only');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        
        // Even on error, ensure client-side data is cleared
        this.currentUser = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('googleUser');
        localStorage.removeItem('session');
        
        // クライアント側のクッキーをクリア - より徹底的に (エラー時も)
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
        
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
          
          // Load user-specific data if on the appropriate page and OrdersModule exists
          try {
            if (window.OrdersModule && typeof window.OrdersModule.loadOrders === 'function') {
              console.log('[Auth] Calling OrdersModule.loadOrders()');
              window.OrdersModule.loadOrders();
            } else {
              console.log('[Auth] OrdersModule not available or loadOrders not a function, skipping');
            }
          } catch (error) {
            console.warn('[Auth] Error calling OrdersModule.loadOrders:', error);
          }
          
          // Pre-fill address if on order page
          // Wrap in setTimeout with a longer delay to ensure OrderPageModule is fully initialized
          setTimeout(() => {
            try {
              if (window.OrderPageModule && typeof window.OrderPageModule.prefillAddressIfLoggedIn === 'function') {
                console.log('[Auth] Calling OrderPageModule.prefillAddressIfLoggedIn()');
                window.OrderPageModule.prefillAddressIfLoggedIn();
              } else {
                console.log('[Auth] OrderPageModule not available or prefillAddressIfLoggedIn not a function, skipping');
              }
            } catch (error) {
              console.warn('[Auth] Error pre-filling address:', error);
            }
          }, 300); // Increased delay to ensure DOM is ready

          // Load user profile data if available
          this.loadUserData(user);
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
     * Load user-specific data
     * @param {Object} user - User data
     */
    loadUserData(user) {
      // Load user profile data if elements exist
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      
      if (nameInput && emailInput) {
        nameInput.value = user.name;
        emailInput.value = user.email;
      }
      
      // Load user addresses if available
      if (user.addresses) {
        this.loadAddresses(user.addresses);
      }
    },

    /**
     * Load user addresses
     * @param {Array} addresses - User addresses
     */
    loadAddresses(addresses) {
      const addressesList = document.querySelector('.addresses-list');
      
      if (!addressesList) return;
      
      if (addresses.length === 0) {
        addressesList.innerHTML = '<p>配送先住所が登録されていません。</p>';
        return;
      }
      
      addressesList.innerHTML = '';
      
      addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = `address-card${address.isDefault ? ' default' : ''}`;
        addressCard.dataset.id = address._id;
        
        addressCard.innerHTML = `
          ${address.isDefault ? '<span class="default-badge">デフォルト</span>' : ''}
          <div class="address-name">${address.name}</div>
          <div class="address-details">
            <div>${address.phone}</div>
            <div>${address.postalCode}</div>
            <div>${address.city} ${address.address}</div>
          </div>
          <div class="address-actions">
            <button class="btn edit-address-btn" data-id="${address._id}">編集</button>
            <button class="btn delete-address-btn" data-id="${address._id}">削除</button>
            ${!address.isDefault ? `<button class="btn btn-primary set-default-btn" data-id="${address._id}">デフォルトに設定</button>` : ''}
          </div>
        `;
        
        addressesList.appendChild(addressCard);
      });
      
      // Add event listeners for address actions
      this.setupAddressEventListeners();
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
        
        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
          profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
          });
        }
        
        // Add address button
        const addAddressBtn = document.getElementById('add-address-btn');
        if (addAddressBtn) {
          addAddressBtn.addEventListener('click', () => {
            this.showAddressModal();
          });
        }
        
        // Address form
        const addressForm = document.getElementById('address-form');
        if (addressForm) {
          addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAddress();
          });
        }
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    },

    /**
     * Set up event listeners for address actions
     */
    setupAddressEventListeners() {
      try {
        // Edit address buttons
        const editButtons = document.querySelectorAll('.edit-address-btn');
        if (editButtons && editButtons.length > 0) {
          editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
              const addressId = btn.dataset.id;
              this.editAddress(addressId);
            });
          });
        }
        
        // Delete address buttons
        const deleteButtons = document.querySelectorAll('.delete-address-btn');
        if (deleteButtons && deleteButtons.length > 0) {
          deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
              const addressId = btn.dataset.id;
              this.deleteAddress(addressId);
            });
          });
        }
        
        // Set default address buttons
        const defaultButtons = document.querySelectorAll('.set-default-btn');
        if (defaultButtons && defaultButtons.length > 0) {
          defaultButtons.forEach(btn => {
            btn.addEventListener('click', () => {
              const addressId = btn.dataset.id;
              this.setDefaultAddress(addressId);
            });
          });
        }
      } catch (error) {
        console.error('Error setting up address event listeners:', error);
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
     * Show address modal for adding or editing an address
     * @param {Object} address - Address data for editing, null for adding
     */
    showAddressModal(address = null) {
      try {
        const modal = document.getElementById('address-modal');
        const form = document.getElementById('address-form');
        
        if (!modal || !form) {
          console.error('Address modal or form not found');
          return;
        }
        
        const title = modal.querySelector('h2');
        
        // Reset form
        form.reset();
        
        if (address) {
          // Editing existing address
          if (title) title.textContent = '配送先住所を編集';
          form.dataset.id = address._id;
          form.dataset.mode = 'edit';
          
          // Fill form with address data
          const nameInput = document.getElementById('address-name');
          const phoneInput = document.getElementById('address-phone');
          const streetInput = document.getElementById('address-street');
          const cityInput = document.getElementById('address-city');
          const postalInput = document.getElementById('address-postal');
          const defaultCheck = document.getElementById('address-default');
          
          if (nameInput) nameInput.value = address.name;
          if (phoneInput) phoneInput.value = address.phone;
          if (streetInput) streetInput.value = address.address;
          if (cityInput) cityInput.value = address.city;
          if (postalInput) postalInput.value = address.postalCode;
          if (defaultCheck) defaultCheck.checked = address.isDefault;
        } else {
          // Adding new address
          if (title) title.textContent = '新しい配送先住所を追加';
          form.dataset.id = '';
          form.dataset.mode = 'add';
        }
        
        modal.style.display = 'block';
        
        const nameInput = document.getElementById('address-name');
        if (nameInput) nameInput.focus();
      } catch (error) {
        console.error('Error showing address modal:', error);
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
    },

    /**
     * Update user profile
     */
    async updateProfile() {
      if (!AuthService.currentUser) return;
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      
      if (!name || !email) {
        alert('名前とメールアドレスを入力してください。');
        return;
      }
      
      try {
        const updatedUser = await API.user.updateProfile(AuthService.currentUser.id, { name, email });
        AuthService.currentUser = updatedUser;
        
        // Update UI
        this.updateAuthUI(AuthService.currentUser);
        
        // Show success message
        alert('プロフィールを更新しました。');
      } catch (error) {
        alert(`プロフィールの更新に失敗しました: ${error.message}`);
      }
    },

    /**
     * Save address (add or update)
     */
    async saveAddress() {
      if (!AuthService.currentUser) return;
      
      const form = document.getElementById('address-form');
      const mode = form.dataset.mode;
      const addressId = form.dataset.id;
      
      const addressData = {
        name: document.getElementById('address-name').value,
        phone: document.getElementById('address-phone').value,
        address: document.getElementById('address-street').value,
        city: document.getElementById('address-city').value,
        postalCode: document.getElementById('address-postal').value,
        isDefault: document.getElementById('address-default').checked
      };
      
      if (!addressData.name || !addressData.phone || !addressData.address || !addressData.city || !addressData.postalCode) {
        alert('すべての項目を入力してください。');
        return;
      }
      
      try {
        let response;
        
        if (mode === 'add') {
          // Add new address
          response = await API.user.addAddress(AuthService.currentUser.id, addressData);
        } else {
          // Update existing address
          response = await API.user.updateAddress(AuthService.currentUser.id, addressId, addressData);
        }
        
        // Update addresses in current user
        AuthService.currentUser.addresses = response.addresses;
        
        // Close modal
        document.getElementById('address-modal').style.display = 'none';
        
        // Update addresses list
        this.loadAddresses(AuthService.currentUser.addresses);
        
        // Show success message
        alert(mode === 'add' ? '住所を追加しました。' : '住所を更新しました。');
      } catch (error) {
        alert(`住所の${mode === 'add' ? '追加' : '更新'}に失敗しました: ${error.message}`);
      }
    },

    /**
     * Edit address
     * @param {string} addressId - Address ID
     */
    editAddress(addressId) {
      if (!AuthService.currentUser || !AuthService.currentUser.addresses) return;
      
      const address = AuthService.currentUser.addresses.find(addr => addr._id === addressId);
      
      if (address) {
        this.showAddressModal(address);
      }
    },

    /**
     * Delete address
     * @param {string} addressId - Address ID
     */
    async deleteAddress(addressId) {
      if (!AuthService.currentUser) return;
      
      if (!confirm('この住所を削除してもよろしいですか？')) {
        return;
      }
      
      try {
        const response = await API.user.deleteAddress(AuthService.currentUser.id, addressId);
        
        // Update addresses in current user
        AuthService.currentUser.addresses = response.addresses;
        
        // Update addresses list
        this.loadAddresses(AuthService.currentUser.addresses);
        
        // Show success message
        alert('住所を削除しました。');
      } catch (error) {
        alert(`住所の削除に失敗しました: ${error.message}`);
      }
    },

    /**
     * Set default address
     * @param {string} addressId - Address ID
     */
    async setDefaultAddress(addressId) {
      if (!AuthService.currentUser) return;
      
      try {
        const address = AuthService.currentUser.addresses.find(addr => addr._id === addressId);
        
        if (!address) return;
        
        const response = await API.user.updateAddress(AuthService.currentUser.id, addressId, {
          ...address,
          isDefault: true
        });
        
        // Update addresses in current user
        AuthService.currentUser.addresses = response.addresses;
        
        // Update addresses list
        this.loadAddresses(AuthService.currentUser.addresses);
        
        // Show success message
        alert('デフォルトの住所を設定しました。');
      } catch (error) {
        alert(`デフォルト住所の設定に失敗しました: ${error.message}`);
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
   * Main Auth Module
   * Combines service, UI, and utilities into a single interface
   */
  const Auth = {
    /**
     * Flag to track initialization
     */
    _initialized: false,

    /**
     * Current user data (for backward compatibility)
     */
    get currentUser() {
      return AuthService.currentUser;
    },

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
     * Show address modal for adding or editing an address
     * @param {Object} address - Address data for editing, null for adding
     */
    showAddressModal(address = null) {
      AuthUI.showAddressModal(address);
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
    console.log('Initializing Auth module from auth.js');
    Auth.init().catch(err => console.error('Error initializing Auth module:', err));
  });

  // For backward compatibility, make Auth and AuthShared available globally
  window.Auth = Auth;
  window.AuthShared = Auth;
})();
