/**
 * Enhanced API Service with timeout handling
 * Handles all API requests to the backend with improved timeout management
 */
const EnhancedAPI = {
  /**
   * Base URL for API requests
   */
  baseURL: '/api',

  /**
   * Default timeout for API requests in milliseconds (90 seconds)
   */
  defaultTimeout: 90000,

  /**
   * Make a GET request with timeout
   * @param {string} endpoint - API endpoint
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise} - Promise with response data
   */
  async get(endpoint, timeout = this.defaultTimeout) {
    try {
      // Create an abort controller for timeout management
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
      
      console.log(`Making GET request to ${this.baseURL}${endpoint} with ${timeout}ms timeout`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: 'include', // Include cookies with the request
        signal // Add the abort signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        console.error(`API GET Error: Request to ${endpoint} timed out after ${timeout}ms`);
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request with timeout
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise} - Promise with response data
   */
  async post(endpoint, data, timeout = this.defaultTimeout) {
    try {
      // Create an abort controller for timeout management
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
      
      console.log(`Making POST request to ${this.baseURL}${endpoint} with ${timeout}ms timeout`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies with the request
        signal // Add the abort signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        console.error(`API POST Error: Request to ${endpoint} timed out after ${timeout}ms`);
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request with timeout
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise} - Promise with response data
   */
  async put(endpoint, data, timeout = this.defaultTimeout) {
    try {
      // Create an abort controller for timeout management
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
      
      console.log(`Making PUT request to ${this.baseURL}${endpoint} with ${timeout}ms timeout`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies with the request
        signal // Add the abort signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        console.error(`API PUT Error: Request to ${endpoint} timed out after ${timeout}ms`);
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request with timeout
   * @param {string} endpoint - API endpoint
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise} - Promise with response data
   */
  async delete(endpoint, timeout = this.defaultTimeout) {
    try {
      // Create an abort controller for timeout management
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
      
      console.log(`Making DELETE request to ${this.baseURL}${endpoint} with ${timeout}ms timeout`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies with the request
        signal // Add the abort signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        console.error(`API DELETE Error: Request to ${endpoint} timed out after ${timeout}ms`);
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  /**
   * Simple in-memory cache for GET requests
   * Key is the endpoint, value is an object with data and expiry time
   */
  cache: {},

  /**
   * Default cache TTL in milliseconds (5 minutes)
   */
  defaultCacheTTL: 5 * 60 * 1000,

  /**
   * Make a GET request with caching
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Options for the request
   * @param {number} options.timeout - Custom timeout in milliseconds (optional)
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @param {number} options.cacheTTL - Cache TTL in milliseconds (optional)
   * @returns {Promise} - Promise with response data
   */
  async getCached(endpoint, options = {}) {
    const {
      timeout = this.defaultTimeout,
      useCache = true,
      cacheTTL = this.defaultCacheTTL
    } = options;
    
    // Check if we should use cache and if the data is in cache and not expired
    if (useCache && this.cache[endpoint] && this.cache[endpoint].expiry > Date.now()) {
      console.log(`Using cached data for ${endpoint}`);
      return this.cache[endpoint].data;
    }
    
    // If not in cache or expired, make the request
    const data = await this.get(endpoint, timeout);
    
    // Store in cache if caching is enabled
    if (useCache) {
      this.cache[endpoint] = {
        data,
        expiry: Date.now() + cacheTTL
      };
    }
    
    return data;
  },

  /**
   * Clear the entire cache
   */
  clearCache() {
    this.cache = {};
  },

  /**
   * Clear a specific endpoint from the cache
   * @param {string} endpoint - API endpoint to clear from cache
   */
  clearCacheForEndpoint(endpoint) {
    delete this.cache[endpoint];
  },

  // Extend the existing API methods with the enhanced ones
  // Products endpoints
  products: {
    /**
     * Get all products with caching
     * @param {Object} filters - Optional filters
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of items per page
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Promise} - Promise with response data
     */
    async getAll(filters = {}, page = 1, limit = 20, useCache = true) {
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
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      // Don't cache search results or paginated results beyond page 1
      const shouldCache = useCache && !filters.search && page === 1;
      
      const response = await EnhancedAPI.getCached(endpoint, {
        useCache: shouldCache,
        cacheTTL: 10 * 60 * 1000 // Cache products for 10 minutes
      });
      
      // If the response is already in the new format with products and pagination
      if (response.products && response.pagination) {
        return response.products;
      }
      // If it's still in the old format (just an array of products)
      return response;
    },

    /**
     * Get a product by ID with caching
     * @param {string} id - Product ID
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Promise} - Promise with response data
     */
    async getById(id, useCache = true) {
      if (!id) {
        console.error('Product ID is undefined or null');
        return Promise.reject(new Error('Product ID is required'));
      }
      
      const endpoint = `/products/${id}`;
      return EnhancedAPI.getCached(endpoint, {
        useCache,
        cacheTTL: 10 * 60 * 1000 // Cache product details for 10 minutes
      });
    },

    /**
     * Get products by category with caching
     * @param {string} category - Category name
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Promise} - Promise with response data
     */
    async getByCategory(category, useCache = true) {
      const endpoint = `/products/category/${category}`;
      return EnhancedAPI.getCached(endpoint, {
        useCache,
        cacheTTL: 10 * 60 * 1000 // Cache category products for 10 minutes
      });
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
      return EnhancedAPI.post('/orders', orderData);
    },

    /**
     * Get all orders for the current user
     * @returns {Promise} - Promise with response data
     */
    getAll() {
      return EnhancedAPI.get('/orders');
    },

    /**
     * Get an order by ID
     * @param {string} id - Order ID
     * @returns {Promise} - Promise with response data
     */
    getById(id) {
      return EnhancedAPI.get(`/orders/${id}`);
    },

    /**
     * Cancel an order
     * @param {string} id - Order ID
     * @returns {Promise} - Promise with response data
     */
    cancel(id) {
      // Clear product cache when cancelling an order as it affects stock
      EnhancedAPI.clearCacheForEndpoint('/products');
      return EnhancedAPI.put(`/orders/${id}/cancel`, {});
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
      return EnhancedAPI.put(`/users/${userId}`, userData);
    },

    /**
     * Add a new address
     * @param {string} userId - User ID
     * @param {Object} addressData - Address data
     * @returns {Promise} - Promise with response data
     */
    addAddress(userId, addressData) {
      return EnhancedAPI.post(`/users/${userId}/addresses`, addressData);
    },

    /**
     * Update an address
     * @param {string} userId - User ID
     * @param {string} addressId - Address ID
     * @param {Object} addressData - Address data to update
     * @returns {Promise} - Promise with response data
     */
    updateAddress(userId, addressId, addressData) {
      return EnhancedAPI.put(`/users/${userId}/addresses/${addressId}`, addressData);
    },

    /**
     * Delete an address
     * @param {string} userId - User ID
     * @param {string} addressId - Address ID
     * @returns {Promise} - Promise with response data
     */
    deleteAddress(userId, addressId) {
      return EnhancedAPI.delete(`/users/${userId}/addresses/${addressId}`);
    }
  },

  // Admin endpoints
  admin: {
    /**
     * Get dashboard data with caching
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Promise} - Promise with response data
     */
    async getDashboard(useCache = true) {
      return EnhancedAPI.getCached('/admin/dashboard', {
        useCache,
        cacheTTL: 5 * 60 * 1000 // Cache dashboard data for 5 minutes
      });
    },

    /**
     * Get all users
     * @returns {Promise} - Promise with response data
     */
    getUsers() {
      return EnhancedAPI.get('/admin/users');
    },

    /**
     * Update user role
     * @param {string} userId - User ID
     * @param {string} role - New role
     * @returns {Promise} - Promise with response data
     */
    updateUserRole(userId, role) {
      return EnhancedAPI.put(`/admin/users/${userId}/role`, { role });
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
      return EnhancedAPI.get(`/admin/orders${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise} - Promise with response data
     */
    updateOrderStatus(orderId, status) {
      return EnhancedAPI.put(`/orders/${orderId}/status`, { status });
    },

    /**
     * Update payment status
     * @param {string} orderId - Order ID
     * @param {string} paymentStatus - New payment status
     * @param {string} transactionId - Optional transaction ID
     * @returns {Promise} - Promise with response data
     */
    updatePaymentStatus(orderId, paymentStatus, transactionId) {
      return EnhancedAPI.put(`/orders/${orderId}/payment`, { paymentStatus, transactionId });
    },

    /**
     * Update shipping details
     * @param {string} orderId - Order ID
     * @param {Object} shippingDetails - Shipping details
     * @returns {Promise} - Promise with response data
     */
    updateShippingDetails(orderId, shippingDetails) {
      return EnhancedAPI.put(`/orders/${orderId}/shipping`, shippingDetails);
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data
     * @returns {Promise} - Promise with response data
     */
    createProduct(productData) {
      // Clear product cache when creating a new product
      EnhancedAPI.clearCacheForEndpoint('/products');
      return EnhancedAPI.post('/products', productData);
    },

    /**
     * Update a product
     * @param {string} productId - Product ID
     * @param {Object} productData - Product data to update
     * @returns {Promise} - Promise with response data
     */
    updateProduct(productId, productData) {
      // Clear product cache when updating a product
      EnhancedAPI.clearCacheForEndpoint('/products');
      EnhancedAPI.clearCacheForEndpoint(`/products/${productId}`);
      return EnhancedAPI.put(`/products/${productId}`, productData);
    },

    /**
     * Delete a product
     * @param {string} productId - Product ID
     * @returns {Promise} - Promise with response data
     */
    deleteProduct(productId) {
      // Clear product cache when deleting a product
      EnhancedAPI.clearCacheForEndpoint('/products');
      EnhancedAPI.clearCacheForEndpoint(`/products/${productId}`);
      return EnhancedAPI.delete(`/products/${productId}`);
    },

    /**
     * Update product stock
     * @param {string} productId - Product ID
     * @param {number} stock - New stock value
     * @returns {Promise} - Promise with response data
     */
    updateProductStock(productId, stock) {
      // Clear product cache when updating stock
      EnhancedAPI.clearCacheForEndpoint('/products');
      EnhancedAPI.clearCacheForEndpoint(`/products/${productId}`);
      return EnhancedAPI.put(`/products/${productId}/stock`, { stock });
    },

    /**
     * Update product status
     * @param {string} productId - Product ID
     * @param {string} status - New status value
     * @returns {Promise} - Promise with response data
     */
    updateProductStatus(productId, status) {
      // Clear product cache when updating status
      EnhancedAPI.clearCacheForEndpoint('/products');
      EnhancedAPI.clearCacheForEndpoint(`/products/${productId}`);
      return EnhancedAPI.put(`/products/${productId}/status`, { status });
    },

    /**
     * Update product shipping estimate
     * @param {string} productId - Product ID
     * @param {string} shippingEstimate - New shipping estimate text
     * @returns {Promise} - Promise with response data
     */
    updateShippingEstimate(productId, shippingEstimate) {
      // Clear product cache when updating shipping estimate
      EnhancedAPI.clearCacheForEndpoint('/products');
      EnhancedAPI.clearCacheForEndpoint(`/products/${productId}`);
      return EnhancedAPI.put(`/products/${productId}/shipping-estimate`, { shippingEstimate });
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
      return EnhancedAPI.get(`/admin/reports/sales${queryString ? `?${queryString}` : ''}`);
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
      return EnhancedAPI.get(`/admin/reports/products${queryString ? `?${queryString}` : ''}`);
    }
  }
};

// Export the enhanced API
export default EnhancedAPI;
