/**
 * API Service
 * Handles all API requests to the backend
 */
const API = {
  /**
   * Base URL for API requests
   */
  baseURL: '/api',

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Promise with response data
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @returns {Promise} - Promise with response data
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @returns {Promise} - Promise with response data
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Promise with response data
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - Promise with response data
     */
    register(userData) {
      return API.post('/users/register', userData);
    },

    /**
     * Login a user
     * @param {Object} credentials - User login credentials
     * @returns {Promise} - Promise with response data
     */
    login(credentials) {
      return API.post('/users/login', credentials);
    },

    /**
     * Login with Google
     * This will redirect to Google's OAuth page
     */
    googleLogin() {
      window.location.href = '/api/users/auth/google';
    },

    /**
     * Logout the current user
     * @returns {Promise} - Promise with response data
     */
    logout() {
      return API.get('/users/logout');
    },

    /**
     * Get the current user
     * @returns {Promise} - Promise with response data
     */
    getCurrentUser() {
      return API.get('/users/current');
    }
  },

  // Products endpoints
  products: {
    /**
     * Get all products
     * @param {Object} filters - Optional filters
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of items per page
     * @returns {Promise} - Promise with response data
     */
    getAll(filters = {}, page = 1, limit = 20) {
      const queryParams = new URLSearchParams();
      
      if (filters.category) {
        queryParams.append('category', filters.category);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.inStock) {
        queryParams.append('inStock', filters.inStock);
      }
      
      // Add pagination parameters
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      return API.get(`/products${queryString ? `?${queryString}` : ''}`)
        .then(response => {
          // If the response is already in the new format with products and pagination
          if (response.products && response.pagination) {
            return response.products;
          }
          // If it's still in the old format (just an array of products)
          return response;
        });
    },

  /**
   * Get a product by ID
   * @param {string} id - Product ID
   * @returns {Promise} - Promise with response data
   */
  getById(id) {
    if (!id) {
      console.error('Product ID is undefined or null');
      return Promise.reject(new Error('Product ID is required'));
    }
    return API.get(`/products/${id}`);
  },

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Promise} - Promise with response data
     */
    getByCategory(category) {
      return API.get(`/products/category/${category}`);
    }
  },

  // Orders endpoints
  orders: {
    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @returns {Promise} - Promise with response data
     */
    create(orderData) {
      return API.post('/orders', orderData);
    },

    /**
     * Get all orders for the current user
     * @returns {Promise} - Promise with response data
     */
    getAll() {
      return API.get('/orders');
    },

    /**
     * Get an order by ID
     * @param {string} id - Order ID
     * @returns {Promise} - Promise with response data
     */
    getById(id) {
      return API.get(`/orders/${id}`);
    },

    /**
     * Cancel an order
     * @param {string} id - Order ID
     * @returns {Promise} - Promise with response data
     */
    cancel(id) {
      return API.put(`/orders/${id}/cancel`, {});
    }
  },

  // User profile endpoints
  user: {
    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} - Promise with response data
     */
    updateProfile(userId, userData) {
      return API.put(`/users/${userId}`, userData);
    },

    /**
     * Add a new address
     * @param {string} userId - User ID
     * @param {Object} addressData - Address data
     * @returns {Promise} - Promise with response data
     */
    addAddress(userId, addressData) {
      return API.post(`/users/${userId}/addresses`, addressData);
    },

    /**
     * Update an address
     * @param {string} userId - User ID
     * @param {string} addressId - Address ID
     * @param {Object} addressData - Address data to update
     * @returns {Promise} - Promise with response data
     */
    updateAddress(userId, addressId, addressData) {
      return API.put(`/users/${userId}/addresses/${addressId}`, addressData);
    },

    /**
     * Delete an address
     * @param {string} userId - User ID
     * @param {string} addressId - Address ID
     * @returns {Promise} - Promise with response data
     */
    deleteAddress(userId, addressId) {
      return API.delete(`/users/${userId}/addresses/${addressId}`);
    }
  },

  // Admin endpoints
  admin: {
    /**
     * Get dashboard data
     * @returns {Promise} - Promise with response data
     */
    getDashboard() {
      return API.get('/admin/dashboard');
    },

    /**
     * Get all users
     * @returns {Promise} - Promise with response data
     */
    getUsers() {
      return API.get('/admin/users');
    },

    /**
     * Update user role
     * @param {string} userId - User ID
     * @param {string} role - New role
     * @returns {Promise} - Promise with response data
     */
    updateUserRole(userId, role) {
      return API.put(`/admin/users/${userId}/role`, { role });
    },

    /**
     * Get all orders with filters
     * @param {Object} filters - Optional filters
     * @returns {Promise} - Promise with response data
     */
    getOrders(filters = {}) {
      const queryParams = new URLSearchParams();
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      if (filters.paymentStatus) {
        queryParams.append('paymentStatus', filters.paymentStatus);
      }
      
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      const queryString = queryParams.toString();
      return API.get(`/admin/orders${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise} - Promise with response data
     */
    updateOrderStatus(orderId, status) {
      return API.put(`/orders/${orderId}/status`, { status });
    },

    /**
     * Update payment status
     * @param {string} orderId - Order ID
     * @param {string} paymentStatus - New payment status
     * @param {string} transactionId - Optional transaction ID
     * @returns {Promise} - Promise with response data
     */
    updatePaymentStatus(orderId, paymentStatus, transactionId) {
      return API.put(`/orders/${orderId}/payment`, { paymentStatus, transactionId });
    },

    /**
     * Update shipping details
     * @param {string} orderId - Order ID
     * @param {Object} shippingDetails - Shipping details
     * @returns {Promise} - Promise with response data
     */
    updateShippingDetails(orderId, shippingDetails) {
      return API.put(`/orders/${orderId}/shipping`, shippingDetails);
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data
     * @returns {Promise} - Promise with response data
     */
    createProduct(productData) {
      return API.post('/products', productData);
    },

    /**
     * Update a product
     * @param {string} productId - Product ID
     * @param {Object} productData - Product data to update
     * @returns {Promise} - Promise with response data
     */
    updateProduct(productId, productData) {
      return API.put(`/products/${productId}`, productData);
    },

    /**
     * Delete a product
     * @param {string} productId - Product ID
     * @returns {Promise} - Promise with response data
     */
    deleteProduct(productId) {
      return API.delete(`/products/${productId}`);
    },

    /**
     * Update product stock
     * @param {string} productId - Product ID
     * @param {number} stock - New stock value
     * @returns {Promise} - Promise with response data
     */
    updateProductStock(productId, stock) {
      return API.put(`/products/${productId}/stock`, { stock });
    },

    /**
     * Update product status
     * @param {string} productId - Product ID
     * @param {string} status - New status value
     * @returns {Promise} - Promise with response data
     */
    updateProductStatus(productId, status) {
      return API.put(`/products/${productId}/status`, { status });
    },

    /**
     * Update product shipping estimate
     * @param {string} productId - Product ID
     * @param {string} shippingEstimate - New shipping estimate text
     * @returns {Promise} - Promise with response data
     */
    updateShippingEstimate(productId, shippingEstimate) {
      return API.put(`/products/${productId}/shipping-estimate`, { shippingEstimate });
    },

    /**
     * Get sales report
     * @param {Object} params - Report parameters
     * @returns {Promise} - Promise with response data
     */
    getSalesReport(params = {}) {
      const queryParams = new URLSearchParams();
      
      if (params.period) {
        queryParams.append('period', params.period);
      }
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      const queryString = queryParams.toString();
      return API.get(`/admin/reports/sales${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get product performance report
     * @param {Object} params - Report parameters
     * @returns {Promise} - Promise with response data
     */
    getProductReport(params = {}) {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      const queryString = queryParams.toString();
      return API.get(`/admin/reports/products${queryString ? `?${queryString}` : ''}`);
    }
  }
};

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

/**
 * Products Module
 * Handles product display and interactions
 */
const ProductsModule = {
  /**
   * Current products data
   */
  products: [],

  /**
   * Featured products
   */
  featuredProducts: [],

  /**
   * Cache expiration time (5 minutes)
   */
  cacheExpirationTime: 5 * 60 * 1000,

  /**
   * Last cache update timestamp
   */
  lastCacheUpdate: 0,

  /**
   * Initialize products module
   */
  async init() {
    await this.fetchProducts();
    this.setupEventListeners();
  },

  /**
   * Cache for products data
   */
  productsCache: null,
  
  /**
   * Cache expiration time in milliseconds (5 minutes)
   */
  cacheDuration: 5 * 60 * 1000,
  
  /**
   * Timestamp when cache was last updated
   */
  cacheTimestamp: 0,
  
  /**
   * Load all products
   */
  async loadProducts() {
    try {
      // Get filter values
      const categorySelect = document.getElementById('category-select');
      const searchInput = document.getElementById('product-search');
      const inStockCheckbox = document.getElementById('in-stock-only');
      
      const filters = {
        category: categorySelect ? categorySelect.value : '',
        search: searchInput ? searchInput.value : '',
        inStock: inStockCheckbox && inStockCheckbox.checked ? 'true' : ''
      };
      
      // Check if we need to fetch from API or can use cache
      // Always fetch from API if filters are applied
      const useCache = !filters.category && !filters.search && !filters.inStock && 
                      this.productsCache && 
                      (Date.now() - this.cacheTimestamp < this.cacheDuration);
      
      if (useCache) {
        console.log('Using cached products data');
        this.products = this.productsCache;
      } else {
        console.log('Fetching products from API');
        // Fetch products with filters
        this.products = await API.products.getAll(filters);
        
        // Update cache if no filters are applied
        if (!filters.category && !filters.search && !filters.inStock) {
          this.productsCache = this.products;
          this.cacheTimestamp = Date.now();
        }
      }
      
      // Render products
      this.renderProducts(this.products, 'all-products-grid');
    } catch (error) {
      console.error('Load products error:', error);
      document.getElementById('all-products-grid').innerHTML = '<p>商品の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Fetch products from API
   */
  async fetchProducts() {
    try {
      // Check if we can use cache
      const useCache = this.productsCache && 
                      (Date.now() - this.lastCacheUpdate < this.cacheExpirationTime);
      
      if (useCache) {
        console.log('Using cached products data');
        this.products = this.productsCache;
      } else {
        console.log('Fetching products from API');
        // Fetch products
        this.products = await API.products.getAll();
        
        // Update cache
        this.productsCache = this.products;
        this.lastCacheUpdate = Date.now();
      }
      
      // Load products and featured products
      this.loadProducts();
      this.loadFeaturedProducts();
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  },

  /**
   * Load featured products
   */
  async loadFeaturedProducts() {
    try {
      // Check if we already have products data in cache or this.products
      if (this.productsCache && (Date.now() - this.cacheTimestamp < this.cacheDuration)) {
        console.log('Using cached products for featured products');
        this.featuredProducts = this.productsCache.slice(0, 4);
      } else if (this.products && this.products.length > 0) {
        console.log('Using current products for featured products');
        this.featuredProducts = this.products.slice(0, 4);
      } else {
        console.log('Fetching products for featured products');
        // Only fetch if we don't have data already
        const allProducts = await API.products.getAll();
        this.featuredProducts = allProducts.slice(0, 4);
        
        // Update cache
        this.productsCache = allProducts;
        this.cacheTimestamp = Date.now();
      }
      
      // Render featured products
      this.renderProducts(this.featuredProducts, 'featured-products-grid');
    } catch (error) {
      console.error('Load featured products error:', error);
      document.getElementById('featured-products-grid').innerHTML = '<p>おすすめ商品の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render products to a container
   * @param {Array} products - Products to render
   * @param {string} containerId - ID of container element
   */
  renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = '<p>商品が見つかりませんでした。</p>';
      return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Add "Start Order" button if this is the all-products-grid
    if (containerId === 'all-products-grid') {
      // Remove any existing button first to avoid duplicates
      const existingButton = document.querySelector('.start-order-container');
      if (existingButton) {
        existingButton.remove();
      }
      
      // Create the button container
      const orderButtonContainer = document.createElement('div');
      orderButtonContainer.className = 'start-order-container';
      orderButtonContainer.innerHTML = `
        <button class="btn btn-primary btn-large start-order-btn">注文を開始する</button>
      `;
      
      // Add the button after the product grid
      container.parentNode.insertBefore(orderButtonContainer, container.nextSibling);
    }
    
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.dataset.id = product._id;
      
      // Get the first image or use a placeholder
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'images/placeholder.jpg';
      
      // Format price with Japanese Yen
      const formattedPrice = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(product.price);
      
      // Stock status - only show out of stock message, not the quantity
      const stockStatus = product.stock > 0
        ? ''
        : '<span style="color: red;">在庫切れ</span>';
      
      // Status display
      let statusDisplay = '';
      if (product.status !== '販売中') {
        statusDisplay = `<div class="product-status">${product.status}</div>`;
      }
      
      productCard.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name} <span class="product-unit">(${product.unit})</span></h3>
          <div class="product-price">${formattedPrice}</div>
          ${stockStatus ? `<div class="product-stock">${stockStatus}</div>` : ''}
          <div class="product-shipping-estimate"><i class="fas fa-truck"></i> ${product.shippingEstimate}</div>
          ${statusDisplay}
          <div class="product-actions">
            <button class="btn view-product-btn" data-id="${product._id}">
              詳細
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(productCard);
    });
    
    // Add event listeners to buttons
    this.setupProductButtonListeners();
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Start Order button (added dynamically, so we need to check after products are loaded)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('start-order-btn')) {
        e.preventDefault();
        // Navigate to the order page using a relative path to ensure cookies are properly maintained
        // This prevents issues with SameSite cookie restrictions in modern browsers
        window.location.href = '/order.html';
      }
    });
    
    // Category filter
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        this.loadProducts();
      });
    }
    
    // Search filter
    const searchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.loadProducts();
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.loadProducts();
        }
      });
    }
    
    // In-stock filter
    const inStockCheckbox = document.getElementById('in-stock-only');
    if (inStockCheckbox) {
      inStockCheckbox.addEventListener('change', () => {
        this.loadProducts();
      });
    }
    
    // Category cards on home page
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        
        // Set category in filter and switch to products tab
        if (categorySelect) {
          categorySelect.value = category;
        }
        
        App.showTab('products');
        this.loadProducts();
      });
    });
    
    // Shop now button
    document.querySelectorAll('[data-action="shop-now"]').forEach(btn => {
      btn.addEventListener('click', () => {
        App.showTab('products');
      });
    });
    
    // Close product modal
    const productModal = document.getElementById('product-modal');
    if (productModal) {
      productModal.querySelector('.close').addEventListener('click', () => {
        productModal.style.display = 'none';
      });
    }
  },

  /**
   * Set up event listeners for product buttons
   */
  setupProductButtonListeners() {
    console.log('Setting up product button listeners');
    
    // View product buttons
    const viewButtons = document.querySelectorAll('.view-product-btn');
    if (viewButtons && viewButtons.length > 0) {
      viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const productId = btn.dataset.id;
          console.log('View product button clicked for product ID:', productId);
          
          if (!productId) {
            console.error('Product ID is missing from view-product button');
            alert('商品IDが見つかりません。');
            return;
          }
          
          this.showProductDetails(productId);
        });
      });
    }
    
    // Make the entire product card clickable
    const productCards = document.querySelectorAll('.product-card');
    if (productCards && productCards.length > 0) {
      productCards.forEach(card => {
        card.addEventListener('click', () => {
          const productId = card.dataset.id;
          console.log('Product card clicked for product ID:', productId);
          
          if (!productId) {
            console.error('Product ID is missing from product card');
            alert('商品IDが見つかりません。');
            return;
          }
          
          this.showProductDetails(productId);
        });
      });
    }
  },

  /**
   * Show product details in modal
   * @param {string} productId - Product ID
   */
  async showProductDetails(productId) {
    try {
      console.log('Fetching product details for ID:', productId);
      
      if (!productId) {
        throw new Error('Product ID is missing');
      }
      
      // Get product details
      const product = await API.products.getById(productId);
      
      console.log('Product details received:', product);
      
      if (!product) {
        throw new Error('Product data is empty or invalid');
      }
      
      // Get modal elements
      const modal = document.getElementById('product-modal');
      if (!modal) {
        throw new Error('Product modal element not found');
      }
      
      const productDetails = modal.querySelector('.product-details');
      if (!productDetails) {
        throw new Error('Product details element not found in modal');
      }
      
      // Get the first image or use a placeholder
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'images/placeholder.jpg';
      
      // Format price with Japanese Yen
      const formattedPrice = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(product.price);
      
      // Stock status - only show out of stock message, not the quantity
      const stockStatus = product.stock > 0
        ? ''
        : '<span style="color: red;">在庫切れ</span>';
      
      // Status display
      let statusDisplay = '';
      if (product.status !== '販売中') {
        statusDisplay = `<div class="product-detail-status">${product.status}</div>`;
      }
      
      // Shipping estimate (only shown for products with status "販売中")
      let shippingEstimate = '';
      if (product.status === '販売中') {
        shippingEstimate = `<div class="product-detail-shipping">
          <i class="fas fa-truck"></i> ${product.shippingEstimate}
        </div>`;
      }
      
      // Product purchasability check removed as cart functionality is disabled
      
      // Render product details
      productDetails.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-detail-image">
        <div class="product-detail-info">
          <h2 class="product-detail-name">${product.name} <span class="product-unit">(${product.unit})</span></h2>
          <div class="product-detail-price">${formattedPrice}</div>
          ${stockStatus ? `<div class="product-detail-stock">${stockStatus}</div>` : ''}
          ${statusDisplay}
          ${shippingEstimate}
          <div class="product-detail-description">${product.description}</div>
        </div>
      `;
      
      // Show modal
      modal.style.display = 'block';
    } catch (error) {
      console.error('Show product details error:', error);
      alert('商品詳細の読み込みに失敗しました。');
    }
  },

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Object|null} - Product object or null if not found
   */
  getProductById(productId) {
    return this.products.find(product => product._id === productId) || null;
  }
};

/**
 * Orders Module
 * Handles order display and management
 */
const OrdersModule = {
  /**
   * Current orders data
   */
  orders: [],

  /**
   * Initialize orders module
   */
  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load orders if user is authenticated
    if (Auth.isAuthenticated()) {
      await this.loadOrders();
    }
  },

  /**
   * Load orders
   */
  async loadOrders() {
    try {
      // Check if user is authenticated
      if (!Auth.isAuthenticated()) {
        return;
      }
      
      // Fetch orders
      this.orders = await API.orders.getAll();
      
      // Render orders
      this.renderOrders();
    } catch (error) {
      console.error('Load orders error:', error);
      document.querySelector('.orders-list').innerHTML = '<p>注文履歴の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render orders
   */
  renderOrders() {
    const ordersList = document.querySelector('.orders-list');
    
    if (!ordersList) {
      return;
    }
    
    if (this.orders.length === 0) {
      ordersList.innerHTML = '<p>注文履歴がありません。</p>';
      return;
    }
    
    ordersList.innerHTML = '';
    
    // Sort orders by date (newest first)
    const sortedOrders = [...this.orders].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedOrders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      orderCard.dataset.id = order._id;
      
      // Format date
      const orderDate = new Date(order.createdAt);
      const formattedDate = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(orderDate);
      
      // Format total with Japanese Yen
      const formattedTotal = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(order.totalAmount);
      
      // Get status class and text
      const statusClass = this.getStatusClass(order.status);
      const statusText = this.getStatusText(order.status);
      
      // Create order header
      const orderHeader = document.createElement('div');
      orderHeader.className = 'order-header';
      orderHeader.innerHTML = `
        <div class="order-id">注文番号: ${order._id}</div>
        <div class="order-date">${formattedDate}</div>
        <div class="order-status ${statusClass}">${statusText}</div>
      `;
      
      // Create order body
      const orderBody = document.createElement('div');
      orderBody.className = 'order-body';
      
      // Create order items
      const orderItems = document.createElement('div');
      orderItems.className = 'order-items';
      
      order.items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        // Get product data
        const product = item.product;
        
        if (!product) {
          return;
        }
        
        // Get the first image or use a placeholder
        const imageUrl = product.images && product.images.length > 0
          ? product.images[0]
          : 'images/placeholder.jpg';
        
        // Format price with Japanese Yen
        const formattedPrice = new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY'
        }).format(item.price);
        
        orderItem.innerHTML = `
          <img src="${imageUrl}" alt="${product.name}" class="order-item-image">
          <div class="order-item-details">
            <div class="order-item-name">${product.name}</div>
            <div class="order-item-price">${formattedPrice} × ${item.quantity}</div>
            <div class="order-item-quantity">配送先: ${item.shippingAddress.name}</div>
          </div>
        `;
        
        orderItems.appendChild(orderItem);
      });
      
      // Create order total
      const orderTotal = document.createElement('div');
      orderTotal.className = 'order-total';
      orderTotal.textContent = `合計: ${formattedTotal}`;
      
      // Create order actions
      const orderActions = document.createElement('div');
      orderActions.className = 'order-actions';
      
      // Add view details button
      const viewDetailsBtn = document.createElement('button');
      viewDetailsBtn.className = 'btn';
      viewDetailsBtn.textContent = '詳細を見る';
      viewDetailsBtn.dataset.id = order._id;
      orderActions.appendChild(viewDetailsBtn);
      
      // Add cancel button if order can be cancelled
      if (order.status === 'pending' || order.status === 'processing') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.dataset.id = order._id;
        orderActions.appendChild(cancelBtn);
        
        // Add event listener for cancel button
        cancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.cancelOrder(order._id);
        });
      }
      
      // Add event listener for view details button
      viewDetailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewOrderDetails(order._id);
      });
      
      // Append elements to order body
      orderBody.appendChild(orderItems);
      orderBody.appendChild(orderTotal);
      orderBody.appendChild(orderActions);
      
      // Append elements to order card
      orderCard.appendChild(orderHeader);
      orderCard.appendChild(orderBody);
      
      // Append order card to orders list
      ordersList.appendChild(orderCard);
    });
  },

  /**
   * Get status class
   * @param {string} status - Order status
   * @returns {string} - Status class
   */
  getStatusClass(status) {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
        return 'cancelled';
      default:
        return '';
    }
  },

  /**
   * Get status text
   * @param {string} status - Order status
   * @returns {string} - Status text
   */
  getStatusText(status) {
    switch (status) {
      case 'pending':
        return '受付中';
      case 'processing':
        return '準備中';
      case 'shipped':
        return '発送済み';
      case 'delivered':
        return '配達済み';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // No global event listeners needed for now
  },

  /**
   * View order details
   * @param {string} orderId - Order ID
   */
  async viewOrderDetails(orderId) {
    try {
      // Fetch order details
      const order = await API.orders.getById(orderId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'order-details-modal';
      
      // Format date
      const orderDate = new Date(order.createdAt);
      const formattedDate = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(orderDate);
      
      // Format total with Japanese Yen
      const formattedTotal = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(order.totalAmount);
      
      // Get status class and text
      const statusClass = this.getStatusClass(order.status);
      const statusText = this.getStatusText(order.status);
      
      // Get payment status text
      const paymentStatusText = this.getPaymentStatusText(order.paymentStatus);
      
      // Get payment method text
      const paymentMethodText = this.getPaymentMethodText(order.paymentMethod);
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>注文詳細</h2>
          <div class="order-details">
            <div class="order-details-header">
              <div class="order-details-id">注文番号: ${order._id}</div>
              <div class="order-details-date">注文日時: ${formattedDate}</div>
              <div class="order-details-status ${statusClass}">${statusText}</div>
            </div>
            <div class="order-details-section">
              <h3>注文商品</h3>
              <div class="order-details-items">
                ${order.items.map(item => {
                  const product = item.product;
                  if (!product) return '';
                  
                  // Format price with Japanese Yen
                  const formattedPrice = new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(item.price);
                  
                  return `
                    <div class="order-details-item">
                      <div class="order-details-item-name">${product.name}</div>
                      <div class="order-details-item-price">${formattedPrice} × ${item.quantity}</div>
                      <div class="order-details-item-subtotal">${new Intl.NumberFormat('ja-JP', {
                        style: 'currency',
                        currency: 'JPY'
                      }).format(item.price * item.quantity)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            <div class="order-details-section">
              <h3>配送先住所</h3>
              <div class="order-details-addresses">
                ${order.items.map(item => {
                  const address = item.shippingAddress;
                  if (!address) return '';
                  
                  return `
                    <div class="order-details-address">
                      <div class="order-details-address-product">${item.product.name} (${item.quantity})</div>
                      <div class="order-details-address-name">${address.name}</div>
                      <div class="order-details-address-phone">${address.phone}</div>
                      <div class="order-details-address-location">${address.postalCode} ${address.city} ${address.address}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            <div class="order-details-section">
              <h3>支払い情報</h3>
              <div class="order-details-payment">
                <div class="order-details-payment-method">支払い方法: ${paymentMethodText}</div>
                <div class="order-details-payment-status">支払い状況: ${paymentStatusText}</div>
                ${order.paymentDetails && order.paymentDetails.transactionId ? `
                  <div class="order-details-payment-transaction">取引ID: ${order.paymentDetails.transactionId}</div>
                ` : ''}
              </div>
            </div>
            <div class="order-details-section">
              <h3>配送情報</h3>
              <div class="order-details-shipping">
                ${order.shippingDetails && order.shippingDetails.carrier ? `
                  <div class="order-details-shipping-carrier">配送業者: ${order.shippingDetails.carrier}</div>
                ` : '配送情報はまだありません。'}
                ${order.shippingDetails && order.shippingDetails.trackingNumber ? `
                  <div class="order-details-shipping-tracking">追跡番号: ${order.shippingDetails.trackingNumber}</div>
                ` : ''}
                ${order.shippingDetails && order.shippingDetails.estimatedDelivery ? `
                  <div class="order-details-shipping-delivery">配送予定日: ${new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(new Date(order.shippingDetails.estimatedDelivery))}</div>
                ` : ''}
              </div>
            </div>
            <div class="order-details-section">
              <h3>合計金額</h3>
              <div class="order-details-total">
                <div class="order-details-total-row">
                  <span>小計:</span>
                  <span>${formattedTotal}</span>
                </div>
                <div class="order-details-total-row">
                  <span>配送料:</span>
                  <span>¥500</span>
                </div>
                <div class="order-details-total-row total">
                  <span>合計:</span>
                  <span>${new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(order.totalAmount + 500)}</span>
                </div>
              </div>
            </div>
            ${order.status === 'pending' || order.status === 'processing' ? `
              <div class="order-details-actions">
                <button class="btn" id="order-details-cancel-btn" data-id="${order._id}">注文をキャンセル</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listener for close button
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Add event listener for cancel button
      const cancelBtn = modal.querySelector('#order-details-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.cancelOrder(orderId);
          modal.style.display = 'none';
          modal.remove();
        });
      }
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('View order details error:', error);
      alert('注文詳細の読み込みに失敗しました。');
    }
  },

  /**
   * Get payment status text
   * @param {string} status - Payment status
   * @returns {string} - Payment status text
   */
  getPaymentStatusText(status) {
    switch (status) {
      case 'pending':
        return '未払い';
      case 'paid':
        return '支払い済み';
      case 'failed':
        return '支払い失敗';
      case 'refunded':
        return '返金済み';
      default:
        return status;
    }
  },

  /**
   * Get payment method text
   * @param {string} method - Payment method
   * @returns {string} - Payment method text
   */
  getPaymentMethodText(method) {
    switch (method) {
      case 'credit_card':
        return 'クレジットカード';
      case 'bank_transfer':
        return '銀行振込';
      case 'cash_on_delivery':
        return '代金引換';
      default:
        return method;
    }
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   */
  async cancelOrder(orderId) {
    try {
      if (!confirm('この注文をキャンセルしてもよろしいですか？')) {
        return;
      }
      
      // Cancel order
      await API.orders.cancel(orderId);
      
      // Reload orders
      await this.loadOrders();
      
      // Show success message
      alert('注文をキャンセルしました。');
    } catch (error) {
      console.error('Cancel order error:', error);
      alert(`注文のキャンセルに失敗しました: ${error.message}`);
    }
  }
};

/**
 * Main Application
 * Initializes and coordinates all modules
 */
const App = {
  /**
   * Initialize application
   */
  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize modules
    await Auth.init();
    await ProductsModule.init();
    // CartModule.init(); // Cart functionality has been removed
    await OrdersModule.init();
    
    // Initialize admin module if user is admin and AdminModule is available
    if (Auth.isAdmin() && typeof AdminModule !== 'undefined') {
      await AdminModule.init();
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        this.showTab(tabName);
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  },

  /**
   * Show tab
   * @param {string} tabName - Tab name
   */
  showTab(tabName) {
    console.log('Showing tab:', tabName);
    // Update active tab link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-links a[data-tab="${tabName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    
    // Special handling for admin tab
    if (tabName === 'admin') {
      console.log('Loading admin dashboard');
      
      // Check if AdminModule is available
      if (typeof AdminModule !== 'undefined') {
        try {
          // First try to use AdminCore directly as it's more reliable
          if (typeof AdminCore !== 'undefined' && typeof AdminCore.showAdminTab === 'function') {
            console.log('Using AdminCore.showAdminTab("dashboard")');
            AdminCore.showAdminTab('dashboard');
            return; // Exit early if successful
          }
          
          // If AdminModule.loadDashboard exists, use it as fallback
          if (typeof AdminModule.loadDashboard === 'function') {
            console.log('Calling AdminModule.loadDashboard()');
            AdminModule.loadDashboard();
          } 
          // Otherwise initialize AdminModule if needed
          else if (typeof AdminModule.init === 'function' && !AdminModule._initialized) {
            console.log('Initializing AdminModule from App.showTab');
            AdminModule._initialized = true;
            AdminModule.init().then(() => {
              console.log('AdminModule initialized, showing dashboard');
              // After initialization, try to show dashboard
              if (typeof AdminCore !== 'undefined' && typeof AdminCore.showAdminTab === 'function') {
                AdminCore.showAdminTab('dashboard');
              }
            });
          } else {
            console.error('No valid method found to load admin dashboard');
          }
        } catch (error) {
          console.error('Error loading admin dashboard:', error);
        }
      } else {
        console.error('AdminModule is not defined - check script loading order');
      }
    }
  },

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    alert(message);
  },

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    alert(message);
  }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
