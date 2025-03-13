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
