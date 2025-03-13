/**
 * Authentication Module
 * Handles user authentication and session management
 */
const Auth = {
  /**
   * Current user data
   */
  currentUser: null,

  /**
   * Initialize authentication
   * Check if user is logged in and update UI
   */
  async init() {
    try {
      // Try to get current user from session
      const user = await this.getCurrentUser();
      this.updateAuthUI(user);
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateAuthUI(null);
    }

    // Set up event listeners
    this.setupEventListeners();
  },

  /**
   * Get current user from session
   * @returns {Promise} - Promise with user data
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
        if (userName) userName.textContent = user.name;
        
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
        
        // Load user-specific data
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
    // Load user profile data
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (nameInput && emailInput) {
      nameInput.value = user.name;
      emailInput.value = user.email;
    }
    
    // Load user addresses
    this.loadAddresses(user.addresses || []);
    
    // Load user orders
    OrdersModule.loadOrders();
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
      const registerModal = document.getElementById('register-modal');
      const loginModal = document.getElementById('login-modal');
      const loginEmail = document.getElementById('login-email');
      
      if (registerModal) registerModal.style.display = 'none';
      if (loginModal) loginModal.style.display = 'block';
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
      
      // Navigate to home
      App.showTab('home');
      
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
    if (!this.currentUser) return;
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (!name || !email) {
      alert('名前とメールアドレスを入力してください。');
      return;
    }
    
    try {
      const updatedUser = await API.user.updateProfile(this.currentUser.id, { name, email });
      this.currentUser = updatedUser;
      
      // Update UI
      this.updateAuthUI(this.currentUser);
      
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
    if (!this.currentUser) return;
    
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
        response = await API.user.addAddress(this.currentUser.id, addressData);
      } else {
        // Update existing address
        response = await API.user.updateAddress(this.currentUser.id, addressId, addressData);
      }
      
      // Update addresses in current user
      this.currentUser.addresses = response.addresses;
      
      // Close modal
      document.getElementById('address-modal').style.display = 'none';
      
      // Update addresses list
      this.loadAddresses(this.currentUser.addresses);
      
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
    if (!this.currentUser || !this.currentUser.addresses) return;
    
    const address = this.currentUser.addresses.find(addr => addr._id === addressId);
    
    if (address) {
      this.showAddressModal(address);
    }
  },

  /**
   * Delete address
   * @param {string} addressId - Address ID
   */
  async deleteAddress(addressId) {
    if (!this.currentUser) return;
    
    if (!confirm('この住所を削除してもよろしいですか？')) {
      return;
    }
    
    try {
      const response = await API.user.deleteAddress(this.currentUser.id, addressId);
      
      // Update addresses in current user
      this.currentUser.addresses = response.addresses;
      
      // Update addresses list
      this.loadAddresses(this.currentUser.addresses);
      
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
    if (!this.currentUser) return;
    
    try {
      const address = this.currentUser.addresses.find(addr => addr._id === addressId);
      
      if (!address) return;
      
      const response = await API.user.updateAddress(this.currentUser.id, addressId, {
        ...address,
        isDefault: true
      });
      
      // Update addresses in current user
      this.currentUser.addresses = response.addresses;
      
      // Update addresses list
      this.loadAddresses(this.currentUser.addresses);
      
      // Show success message
      alert('デフォルトの住所を設定しました。');
    } catch (error) {
      alert(`デフォルト住所の設定に失敗しました: ${error.message}`);
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
