/**
 * Order Page Module
 * Handles order page functionality with multiple shipping destinations
 */
const OrderPageModule = {
  /**
   * Products data
   */
  products: [],

  /**
   * Destinations data
   * Array of objects with destination ID, address info, and products
   */
  destinations: [],

  /**
   * Next destination ID
   */
  nextDestinationId: 2,

  /**
   * Initialize order module
   */
  async init() {
    try {
      console.log('Initializing order module');
      
      // Load products
      await this.loadProducts();
      
      // Initialize first destination
      this.destinations = [{
        id: 1,
        name: '',
        phone: '',
        postalCode: '',
        city: '',
        address: '',
        products: this.initializeProductQuantities()
      }];
      
      // Render products for first destination
      this.renderProductSelection(1);
      
      // Render order summary
      this.renderOrderSummary();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Pre-fill address if user is logged in
      this.prefillAddressIfLoggedIn();
      
      console.log('Order module initialized');
    } catch (error) {
      console.error('Error initializing order module:', error);
      alert('注文ページの初期化中にエラーが発生しました。');
    }
  },

  /**
   * Load products from API
   */
  async loadProducts() {
    try {
      console.log('Loading products');
      
      // Fetch products
      this.products = await API.products.getAll();
      
      // Filter out products that are not available
      this.products = this.products.filter(product => 
        product.status === '販売中' && product.stock > 0
      );
      
      console.log('Products loaded:', this.products.length);
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  },

  /**
   * Initialize product quantities
   * @returns {Object} - Object with product IDs as keys and quantity 0 as values
   */
  initializeProductQuantities() {
    const quantities = {};
    
    this.products.forEach(product => {
      quantities[product._id] = 0;
    });
    
    return quantities;
  },

  /**
   * Look up address by postal code
   * @param {string} postalCode - Postal code
   * @returns {Promise} - Promise with address data
   */
  async lookupAddressByPostalCode(postalCode) {
    try {
      // Remove any non-digit characters
      const cleanPostalCode = postalCode.replace(/[^\d]/g, '');
      
      // Check if postal code is valid (7 digits for Japan)
      if (cleanPostalCode.length !== 7) {
        throw new Error('郵便番号は7桁で入力してください。');
      }
      
      // Format postal code as XXX-XXXX
      const formattedPostalCode = `${cleanPostalCode.substring(0, 3)}-${cleanPostalCode.substring(3)}`;
      
      // Call the Japanese postal code API
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanPostalCode}`);
      const data = await response.json();
      
      if (data.status !== 200) {
        throw new Error(`API エラー: ${data.message}`);
      }
      
      if (!data.results || data.results.length === 0) {
        throw new Error('該当する住所が見つかりませんでした。');
      }
      
      // Get the first result
      const result = data.results[0];
      
      return {
        prefecture: result.address1, // 都道府県
        city: result.address2,       // 市区町村
        street: result.address3,     // 町域
        postalCode: formattedPostalCode
      };
    } catch (error) {
      console.error('Postal code lookup error:', error);
      throw error;
    }
  },

  /**
   * Render product selection for a destination
   * @param {number} destinationId - Destination ID
   */
  renderProductSelection(destinationId) {
    const container = document.getElementById(`product-selection-${destinationId}`);
    
    if (!container) {
      console.error(`Product selection container not found for destination ${destinationId}`);
      return;
    }
    
    if (this.products.length === 0) {
      container.innerHTML = '<p>商品が見つかりませんでした。</p>';
      return;
    }
    
    // Find destination
    const destination = this.destinations.find(dest => dest.id === destinationId);
    
    if (!destination) {
      console.error(`Destination ${destinationId} not found`);
      return;
    }
    
    container.innerHTML = '';
    
    this.products.forEach(product => {
      const productItem = document.createElement('div');
      productItem.className = 'product-selection-item';
      
      // Get the first image or use a placeholder
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'images/placeholder.jpg';
      
      // Format price with Japanese Yen
      const formattedPrice = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(product.price);
      
      // Get current quantity
      const quantity = destination.products[product._id] || 0;
      
      productItem.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-selection-image">
        <div class="product-selection-info">
          <div class="product-selection-name">${product.name} <span class="product-unit">(${product.unit})</span></div>
          <div class="product-selection-price">${formattedPrice}</div>
        </div>
        <div class="product-selection-quantity">
          <div class="quantity-selector">
            <button type="button" class="quantity-btn decrease-btn" data-product-id="${product._id}" data-destination-id="${destinationId}">-</button>
            <input type="number" class="quantity-input" value="${quantity}" min="0" max="${product.stock}" 
              data-product-id="${product._id}" data-destination-id="${destinationId}">
            <button type="button" class="quantity-btn increase-btn" data-product-id="${product._id}" data-destination-id="${destinationId}">+</button>
          </div>
        </div>
      `;
      
      container.appendChild(productItem);
    });
    
    // Add event listeners for quantity buttons
    this.setupQuantityListeners(destinationId);
  },

  /**
   * Set up quantity listeners for a destination
   * @param {number} destinationId - Destination ID
   */
  setupQuantityListeners(destinationId) {
    // Decrease buttons
    document.querySelectorAll(`.decrease-btn[data-destination-id="${destinationId}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const input = document.querySelector(`.quantity-input[data-product-id="${productId}"][data-destination-id="${destinationId}"]`);
        let value = parseInt(input.value);
        
        if (value > 0) {
          value--;
          input.value = value;
          this.updateProductQuantity(destinationId, productId, value);
        }
      });
    });
    
    // Increase buttons
    document.querySelectorAll(`.increase-btn[data-destination-id="${destinationId}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const input = document.querySelector(`.quantity-input[data-product-id="${productId}"][data-destination-id="${destinationId}"]`);
        let value = parseInt(input.value);
        
        const product = this.products.find(p => p._id === productId);
        
        if (value < product.stock) {
          value++;
          input.value = value;
          this.updateProductQuantity(destinationId, productId, value);
        }
      });
    });
    
    // Quantity inputs
    document.querySelectorAll(`.quantity-input[data-destination-id="${destinationId}"]`).forEach(input => {
      input.addEventListener('change', () => {
        const productId = input.dataset.productId;
        let value = parseInt(input.value);
        
        if (isNaN(value) || value < 0) {
          value = 0;
          input.value = value;
        }
        
        const product = this.products.find(p => p._id === productId);
        
        if (value > product.stock) {
          value = product.stock;
          input.value = value;
        }
        
        this.updateProductQuantity(destinationId, productId, value);
      });
    });
  },

  /**
   * Update product quantity for a destination
   * @param {number} destinationId - Destination ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  updateProductQuantity(destinationId, productId, quantity) {
    // Find destination
    const destination = this.destinations.find(dest => dest.id === destinationId);
    
    if (!destination) {
      console.error(`Destination ${destinationId} not found`);
      return;
    }
    
    // Update quantity
    destination.products[productId] = quantity;
    
    // Update order summary
    this.renderOrderSummary();
  },

  /**
   * Render order summary
   */
  renderOrderSummary() {
    const container = document.getElementById('order-summary-container');
    
    if (!container) {
      console.error('Order summary container not found');
      return;
    }
    
    // Calculate totals
    let totalItems = 0;
    let subtotal = 0;
    const shipping = 500; // Fixed shipping cost per destination
    
    // Check if any products are selected
    let hasProducts = false;
    
    this.destinations.forEach(destination => {
      Object.entries(destination.products).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          hasProducts = true;
          const product = this.products.find(p => p._id === productId);
          totalItems += quantity;
          subtotal += product.price * quantity;
        }
      });
    });
    
    // Calculate total with shipping
    const total = subtotal + (shipping * this.destinations.length);
    
    // Format with Japanese Yen
    const formattedSubtotal = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(subtotal);
    
    const formattedShipping = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(shipping);
    
    const formattedTotal = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(total);
    
    // Render summary
    let html = '';
    
    if (!hasProducts) {
      html = '<p>商品が選択されていません。</p>';
    } else {
      html = `
        <div class="summary-item">
          <span>商品点数:</span>
          <span>${totalItems}点</span>
        </div>
      `;
      
      // Add destination details
      this.destinations.forEach(destination => {
        let destinationHasProducts = false;
        let destinationTotal = 0;
        
        // Check if destination has products
        Object.values(destination.products).forEach(quantity => {
          if (quantity > 0) {
            destinationHasProducts = true;
          }
        });
        
        if (destinationHasProducts) {
          html += `
            <div class="summary-destination">
              <div class="summary-destination-header">配送先 #${destination.id}</div>
          `;
          
          // Add address if filled
          if (destination.name && destination.address) {
            html += `
              <div class="summary-destination-address">
                ${destination.name}<br>
                ${destination.postalCode} ${destination.city} ${destination.address}<br>
                ${destination.phone}
              </div>
            `;
          } else {
            html += `<div class="summary-destination-address">住所が入力されていません</div>`;
          }
          
          // Add products
          Object.entries(destination.products).forEach(([productId, quantity]) => {
            if (quantity > 0) {
              const product = this.products.find(p => p._id === productId);
              const productTotal = product.price * quantity;
              destinationTotal += productTotal;
              
              const formattedProductPrice = new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(productTotal);
              
              html += `
                <div class="summary-product">
                  <div class="summary-product-name">${product.name}</div>
                  <div class="summary-product-quantity">${quantity}${product.unit}</div>
                  <div class="summary-product-price">${formattedProductPrice}</div>
                </div>
              `;
            }
          });
          
          // Add shipping
          html += `
            <div class="summary-product">
              <div class="summary-product-name">配送料</div>
              <div class="summary-product-price">${formattedShipping}</div>
            </div>
          `;
          
          html += '</div>';
        }
      });
      
      // Add subtotal and total
      html += `
        <div class="summary-subtotal summary-item">
          <span>小計:</span>
          <span>${formattedSubtotal}</span>
        </div>
        <div class="summary-total summary-item">
          <span>合計:</span>
          <span>${formattedTotal}</span>
        </div>
      `;
    }
    
    container.innerHTML = html;
    
    // Update confirm button state
    const confirmBtn = document.getElementById('confirm-order-btn');
    if (confirmBtn) {
      confirmBtn.disabled = !hasProducts;
    }
  },

  /**
   * Add a new destination
   */
  addDestination() {
    // Create new destination
    const newDestination = {
      id: this.nextDestinationId++,
      name: '',
      phone: '',
      postalCode: '',
      city: '',
      address: '',
      products: this.initializeProductQuantities()
    };
    
    // Add to destinations
    this.destinations.push(newDestination);
    
    // Render new destination
    this.renderNewDestination(newDestination.id);
    
    // Update order summary
    this.renderOrderSummary();
  },

  /**
   * Render a new destination
   * @param {number} destinationId - Destination ID
   */
  renderNewDestination(destinationId) {
    const container = document.getElementById('shipping-destinations-container');
    
    if (!container) {
      console.error('Shipping destinations container not found');
      return;
    }
    
    const destinationElement = document.createElement('div');
    destinationElement.className = 'shipping-destination';
    destinationElement.dataset.destinationId = destinationId;
    
    destinationElement.innerHTML = `
      <div class="destination-header">
        <h4>お届け先 #${destinationId}</h4>
        <button type="button" class="remove-destination-btn" data-destination-id="${destinationId}">
          <i class="fas fa-times"></i> 削除
        </button>
      </div>
      <div class="destination-form">
        <div class="form-group name-group">
          <label for="name-${destinationId}">お名前</label>
          <div class="name-input-container">
            <input type="text" id="name-${destinationId}" name="name-${destinationId}" required>
            <span class="name-suffix">様</span>
          </div>
        </div>
        <div class="form-group">
          <label for="postal-${destinationId}">郵便番号</label>
          <input type="text" id="postal-${destinationId}" name="postal-${destinationId}" required placeholder="例: 123-4567">
        </div>
        <div class="form-group">
          <label for="prefecture-${destinationId}">都道府県</label>
          <input type="text" id="prefecture-${destinationId}" name="prefecture-${destinationId}" required>
        </div>
        <div class="form-group">
          <label for="address-${destinationId}">住所</label>
          <input type="text" id="address-${destinationId}" name="address-${destinationId}" required>
        </div>
        <div class="form-group">
          <label for="phone-${destinationId}">電話番号</label>
          <input type="tel" id="phone-${destinationId}" name="phone-${destinationId}" required>
        </div>
      </div>
      
      <div class="destination-products">
        <h4>商品選択</h4>
        <div class="product-selection-container" id="product-selection-${destinationId}">
          <!-- Products will be loaded here dynamically -->
          <div class="loading-products">商品を読み込み中...</div>
        </div>
      </div>
    `;
    
    container.appendChild(destinationElement);
    
    // Render products
    this.renderProductSelection(destinationId);
    
    // Add event listeners for form fields
    this.setupDestinationFormListeners(destinationId);
    
    // Add event listener for remove button
    const removeBtn = destinationElement.querySelector('.remove-destination-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.removeDestination(destinationId);
      });
    }
  },

  /**
   * Set up event listeners for destination form fields
   * @param {number} destinationId - Destination ID
   */
  setupDestinationFormListeners(destinationId) {
    // Name input
    const nameInput = document.getElementById(`name-${destinationId}`);
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        this.updateDestinationField(destinationId, 'name', nameInput.value);
      });
    }
    
    // Phone input
    const phoneInput = document.getElementById(`phone-${destinationId}`);
    if (phoneInput) {
      phoneInput.addEventListener('change', () => {
        this.updateDestinationField(destinationId, 'phone', phoneInput.value);
      });
    }
    
    // Postal code input with address lookup
    const postalInput = document.getElementById(`postal-${destinationId}`);
    if (postalInput) {
      postalInput.addEventListener('change', async () => {
        const postalCode = postalInput.value;
        this.updateDestinationField(destinationId, 'postalCode', postalCode);
        
        // Try to lookup address by postal code
        if (postalCode && postalCode.length >= 7) {
          try {
            const addressData = await this.lookupAddressByPostalCode(postalCode);
            
            // Update prefecture field
            const prefectureInput = document.getElementById(`prefecture-${destinationId}`);
            if (prefectureInput) {
              prefectureInput.value = addressData.prefecture;
              this.updateDestinationField(destinationId, 'prefecture', addressData.prefecture);
            }
            
            // Update address field with city and street
            const addressInput = document.getElementById(`address-${destinationId}`);
            if (addressInput) {
              const fullAddress = `${addressData.city}${addressData.street}`;
              addressInput.value = fullAddress;
              this.updateDestinationField(destinationId, 'address', fullAddress);
            }
            
          } catch (error) {
            console.error('Address lookup error:', error);
            // Don't show alert to avoid disrupting the user experience
          }
        }
      });
    }
    
    // Prefecture input
    const prefectureInput = document.getElementById(`prefecture-${destinationId}`);
    if (prefectureInput) {
      prefectureInput.addEventListener('change', () => {
        this.updateDestinationField(destinationId, 'prefecture', prefectureInput.value);
      });
    }
    
    // Address input
    const addressInput = document.getElementById(`address-${destinationId}`);
    if (addressInput) {
      addressInput.addEventListener('change', () => {
        this.updateDestinationField(destinationId, 'address', addressInput.value);
      });
    }
  },

  /**
   * Update destination field
   * @param {number} destinationId - Destination ID
   * @param {string} field - Field name
   * @param {string} value - Field value
   */
  updateDestinationField(destinationId, field, value) {
    // Find destination
    const destination = this.destinations.find(dest => dest.id === destinationId);
    
    if (!destination) {
      console.error(`Destination ${destinationId} not found`);
      return;
    }
    
    // Update field
    destination[field] = value;
    
    // Update order summary
    this.renderOrderSummary();
  },

  /**
   * Remove a destination
   * @param {number} destinationId - Destination ID
   */
  removeDestination(destinationId) {
    // Cannot remove the first destination
    if (destinationId === 1) {
      alert('最初の配送先は削除できません。');
      return;
    }
    
    // Remove from destinations array
    this.destinations = this.destinations.filter(dest => dest.id !== destinationId);
    
    // Remove from DOM
    const destinationElement = document.querySelector(`.shipping-destination[data-destination-id="${destinationId}"]`);
    if (destinationElement) {
      destinationElement.remove();
    }
    
    // Update order summary
    this.renderOrderSummary();
  },

  /**
   * Pre-fill address if user is logged in
   */
  prefillAddressIfLoggedIn() {
    // Check if Auth is initialized and user is authenticated
    if (typeof Auth !== 'undefined' && Auth.isAuthenticated() && Auth.currentUser && Auth.currentUser.addresses && Auth.currentUser.addresses.length > 0) {
      console.log('User is authenticated, pre-filling address');
      
      // Get default address or first address
      const defaultAddress = Auth.currentUser.addresses.find(addr => addr.isDefault) || Auth.currentUser.addresses[0];
      
      // Fill first destination form
      document.getElementById('name-1').value = defaultAddress.name || '';
      document.getElementById('phone-1').value = defaultAddress.phone || '';
      document.getElementById('postal-1').value = defaultAddress.postalCode || '';
      
      // Check if prefecture/city fields exist (they might have different IDs)
      const prefectureInput = document.getElementById('prefecture-1');
      if (prefectureInput) {
        prefectureInput.value = defaultAddress.prefecture || '';
      }
      
      const cityInput = document.getElementById('city-1');
      if (cityInput) {
        cityInput.value = defaultAddress.city || '';
      }
      
      document.getElementById('address-1').value = defaultAddress.address || '';
      
      // Update destination data
      this.destinations[0].name = defaultAddress.name || '';
      this.destinations[0].phone = defaultAddress.phone || '';
      this.destinations[0].postalCode = defaultAddress.postalCode || '';
      this.destinations[0].city = defaultAddress.city || '';
      this.destinations[0].address = defaultAddress.address || '';
      
      // Update order summary
      this.renderOrderSummary();
    } else {
      console.log('User is not authenticated or has no addresses');
    }
  },

  /**
   * Validate order
   * @returns {boolean} - True if valid, false otherwise
   */
  validateOrder() {
    // Check if any products are selected
    let hasProducts = false;
    
    for (const destination of this.destinations) {
      let destinationHasProducts = false;
      
      // Check if destination has products
      Object.values(destination.products).forEach(quantity => {
        if (quantity > 0) {
          hasProducts = true;
          destinationHasProducts = true;
        }
      });
      
      // Check if destination with products has address
      if (destinationHasProducts) {
        if (!destination.name || !destination.phone || !destination.postalCode || 
            !destination.city || !destination.address) {
          alert(`配送先 #${destination.id} の住所情報を入力してください。`);
          return false;
        }
      }
    }
    
    if (!hasProducts) {
      alert('商品が選択されていません。');
      return false;
    }
    
    return true;
  },

  /**
   * Show order confirmation
   */
  showOrderConfirmation() {
    // Validate order
    if (!this.validateOrder()) {
      return;
    }
    
    const modal = document.getElementById('order-confirmation-modal');
    const content = document.getElementById('order-confirmation-content');
    
    if (!modal || !content) {
      console.error('Order confirmation modal or content not found');
      return;
    }
    
    // Calculate totals
    let totalItems = 0;
    let subtotal = 0;
    const shipping = 500; // Fixed shipping cost per destination
    
    // Render confirmation content
    let html = '<h3>注文内容の確認</h3>';
    
    // Add destination details
    this.destinations.forEach(destination => {
      let destinationHasProducts = false;
      let destinationTotal = 0;
      
      // Check if destination has products
      Object.values(destination.products).forEach(quantity => {
        if (quantity > 0) {
          destinationHasProducts = true;
        }
      });
      
      if (destinationHasProducts) {
        html += `
          <div class="summary-destination">
            <div class="summary-destination-header">配送先 #${destination.id}</div>
            <div class="summary-destination-address">
              ${destination.name}<br>
              ${destination.postalCode} ${destination.city} ${destination.address}<br>
              ${destination.phone}
            </div>
        `;
        
        // Add products
        Object.entries(destination.products).forEach(([productId, quantity]) => {
          if (quantity > 0) {
            const product = this.products.find(p => p._id === productId);
            const productTotal = product.price * quantity;
            destinationTotal += productTotal;
            totalItems += quantity;
            subtotal += productTotal;
            
            const formattedProductPrice = new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY'
            }).format(productTotal);
            
            html += `
              <div class="summary-product">
                <div class="summary-product-name">${product.name}</div>
                <div class="summary-product-quantity">${quantity}${product.unit}</div>
                <div class="summary-product-price">${formattedProductPrice}</div>
              </div>
            `;
          }
        });
        
        // Add shipping
        html += `
          <div class="summary-product">
            <div class="summary-product-name">配送料</div>
            <div class="summary-product-price">${new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY'
            }).format(shipping)}</div>
          </div>
        `;
        
        html += '</div>';
      }
    });
    
    // Calculate total with shipping
    const total = subtotal + (shipping * this.destinations.filter(dest => {
      return Object.values(dest.products).some(quantity => quantity > 0);
    }).length);
    
    // Add subtotal and total
    html += `
      <div class="summary-subtotal summary-item">
        <span>小計:</span>
        <span>${new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY'
        }).format(subtotal)}</span>
      </div>
      <div class="summary-total summary-item">
        <span>合計:</span>
        <span>${new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY'
        }).format(total)}</span>
      </div>
    `;
    
    content.innerHTML = html;
    
    // Show modal
    modal.style.display = 'block';
  },

  /**
   * Place order
   */
  async placeOrder() {
    try {
      // Check if user is authenticated
      if (!Auth.isAuthenticated()) {
        alert('注文を確定するにはログインしてください。');
        Auth.showLoginModal();
        return;
      }
      
      // Prepare order items
      const items = [];
      
      this.destinations.forEach(destination => {
        Object.entries(destination.products).forEach(([productId, quantity]) => {
          if (quantity > 0) {
            items.push({
              product: productId,
              quantity,
              shippingAddress: {
                name: destination.name,
                phone: destination.phone,
                address: destination.address,
                city: destination.city,
                postalCode: destination.postalCode
              }
            });
          }
        });
      });
      
      // Create order
      const orderData = {
        items,
        paymentMethod: 'credit_card' // Default payment method
      };
      
      // Send order to API
      const order = await API.orders.create(orderData);
      
      // Close modal
      document.getElementById('order-confirmation-modal').style.display = 'none';
      
      // Show success message
      alert('ご注文ありがとうございます。注文が完了しました。');
      
      // Redirect to orders page
      window.location.href = '/';
    } catch (error) {
      console.error('Place order error:', error);
      alert(`注文の処理中にエラーが発生しました: ${error.message}`);
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add destination button
    const addDestinationBtn = document.getElementById('add-destination-btn');
    if (addDestinationBtn) {
      addDestinationBtn.addEventListener('click', () => {
        this.addDestination();
      });
    }
    
    // Back to products button
    const backToProductsBtn = document.getElementById('back-to-products-btn');
    if (backToProductsBtn) {
      backToProductsBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
    
    // Confirm order button
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener('click', () => {
        this.showOrderConfirmation();
      });
    }
    
    // Set up destination form listeners for first destination
    this.setupDestinationFormListeners(1);
    
    // Order confirmation modal close button
    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    if (orderConfirmationModal) {
      const closeBtn = orderConfirmationModal.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          orderConfirmationModal.style.display = 'none';
        });
      }
    }
    
    // Edit order button
    const editOrderBtn = document.getElementById('edit-order-btn');
    if (editOrderBtn) {
      editOrderBtn.addEventListener('click', () => {
        document.getElementById('order-confirmation-modal').style.display = 'none';
      });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        this.placeOrder();
      });
    }
    
    // Login and register buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn && typeof Auth !== 'undefined') {
      loginBtn.addEventListener('click', () => {
        Auth.showLoginModal();
      });
    }
    
    if (registerBtn && typeof Auth !== 'undefined') {
      registerBtn.addEventListener('click', () => {
        Auth.showRegisterModal();
      });
    }
  }
};

// Initialize order module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  OrderPageModule.init();
});
