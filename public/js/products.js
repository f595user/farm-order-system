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
