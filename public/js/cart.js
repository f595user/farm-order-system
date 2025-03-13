/**
 * Cart Module
 * Handles shopping cart functionality
 */
const CartModule = {
  /**
   * Cart items
   * Array of objects with product ID, quantity, and product data
   */
  items: [],

  /**
   * Initialize cart module
   */
  init() {
    // Load cart from local storage
    this.loadCart();
    
    // Update cart UI
    this.updateCartUI();
    
    // Set up event listeners
    this.setupEventListeners();
  },

  /**
   * Load cart from local storage
   */
  loadCart() {
    const savedCart = localStorage.getItem('cart');
    
    if (savedCart) {
      try {
        this.items = JSON.parse(savedCart);
      } catch (error) {
        console.error('Error parsing cart from local storage:', error);
        this.items = [];
      }
    }
  },

  /**
   * Save cart to local storage
   */
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  },

  /**
   * Add product to cart
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   */
  async addToCart(productId, quantity) {
    try {
      console.log('Adding to cart - Product ID:', productId, 'Quantity:', quantity);
      
      if (!productId) {
        throw new Error('商品IDが指定されていません。');
      }
      
      if (!quantity || quantity <= 0) {
        throw new Error('数量が正しく指定されていません。');
      }
      
      // Get product data
      const product = await API.products.getById(productId);
      
      console.log('Product data received:', product);
      
      if (!product) {
        throw new Error('商品が見つかりませんでした。');
      }
      
      if (product.status !== '販売中') {
        throw new Error(`この商品は現在${product.status}です。`);
      }
      
      if (product.stock < quantity) {
        throw new Error(`在庫が不足しています。現在の在庫数: ${product.stock}`);
      }
      
      // Check if product is already in cart
      const existingItemIndex = this.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex !== -1) {
        // Update quantity
        this.items[existingItemIndex].quantity += quantity;
        
        // Check if quantity exceeds stock
        if (this.items[existingItemIndex].quantity > product.stock) {
          this.items[existingItemIndex].quantity = product.stock;
        }
      } else {
        // Add new item
        this.items.push({
          productId,
          quantity,
          product
        });
      }
      
      // Save cart
      this.saveCart();
      
      // Update cart UI
      this.updateCartUI();
      
      // Show success message
      alert(`${product.name}をカートに追加しました。`);
    } catch (error) {
      console.error('Add to cart error:', error);
      alert(`カートに追加できませんでした: ${error.message}`);
    }
  },

  /**
   * Update cart item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  async updateCartItemQuantity(productId, quantity) {
    try {
      console.log('Updating cart item quantity - Product ID:', productId, 'New quantity:', quantity);
      
      if (!productId) {
        throw new Error('商品IDが指定されていません。');
      }
      
      if (!quantity || quantity <= 0) {
        throw new Error('数量が正しく指定されていません。');
      }
      
      // Get product data
      const product = await API.products.getById(productId);
      
      console.log('Product data received for quantity update:', product);
      
      if (!product) {
        throw new Error('商品が見つかりませんでした。');
      }
      
      if (product.status !== '販売中') {
        throw new Error(`この商品は現在${product.status}です。`);
      }
      
      if (product.stock < quantity) {
        throw new Error(`在庫が不足しています。現在の在庫数: ${product.stock}`);
      }
      
      // Find item in cart
      const itemIndex = this.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('商品がカートに見つかりませんでした。');
      }
      
      // Update quantity
      this.items[itemIndex].quantity = quantity;
      
      // Update product data in cart item to ensure it's fresh
      this.items[itemIndex].product = product;
      
      // Save cart
      this.saveCart();
      
      // Update cart UI
      this.updateCartUI();
      
      console.log('Cart item quantity updated successfully');
    } catch (error) {
      console.error('Update cart item quantity error:', error);
      alert(`数量を更新できませんでした: ${error.message}`);
    }
  },

  /**
   * Remove item from cart
   * @param {string} productId - Product ID
   */
  removeFromCart(productId) {
    // Find item in cart
    const itemIndex = this.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return;
    }
    
    // Remove item
    this.items.splice(itemIndex, 1);
    
    // Save cart
    this.saveCart();
    
    // Update cart UI
    this.updateCartUI();
  },

  /**
   * Clear cart
   */
  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartUI();
  },

  /**
   * Calculate cart total
   * @returns {number} - Cart total
   */
  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  },

  /**
   * Calculate cart item count
   * @returns {number} - Cart item count
   */
  calculateItemCount() {
    return this.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  },

  /**
   * Update cart UI
   */
  updateCartUI() {
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = this.calculateItemCount();
    }
    
    // Update cart items
    const cartItems = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItems || !emptyCartMessage || !cartSummary) {
      return;
    }
    
    if (this.items.length === 0) {
      // Cart is empty
      cartItems.classList.add('hidden');
      emptyCartMessage.classList.remove('hidden');
      cartSummary.classList.add('hidden');
      return;
    }
    
    // Cart has items
    cartItems.classList.remove('hidden');
    emptyCartMessage.classList.add('hidden');
    cartSummary.classList.remove('hidden');
    
    // Render cart items
    cartItems.innerHTML = '';
    
    this.items.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      // Get the first image or use a placeholder
      const imageUrl = item.product.images && item.product.images.length > 0
        ? item.product.images[0]
        : 'images/placeholder.jpg';
      
      // Format price with Japanese Yen
      const formattedPrice = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(item.product.price);
      
      // Format subtotal with Japanese Yen
      const formattedSubtotal = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(item.product.price * item.quantity);
      
      cartItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.product.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.product.name}</h3>
          <div class="cart-item-price">${formattedPrice}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease-btn" data-id="${item.productId}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.product.stock}" data-id="${item.productId}">
            <button class="quantity-btn increase-btn" data-id="${item.productId}">+</button>
          </div>
        </div>
        <div class="cart-item-subtotal">${formattedSubtotal}</div>
        <div class="cart-item-remove" data-id="${item.productId}">
          <i class="fas fa-trash"></i>
        </div>
      `;
      
      cartItems.appendChild(cartItem);
    });
    
    // Update cart summary
    const subtotal = this.calculateTotal();
    const shipping = 500; // Fixed shipping cost
    const total = subtotal + shipping;
    
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
    
    document.querySelector('.cart-subtotal').textContent = formattedSubtotal;
    document.querySelector('.cart-shipping').textContent = formattedShipping;
    document.querySelector('.cart-total').textContent = formattedTotal;
    
    // Add event listeners to cart items
    this.setupCartItemListeners();
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Continue shopping button
    document.querySelectorAll('[data-action="continue-shopping"]').forEach(btn => {
      btn.addEventListener('click', () => {
        App.showTab('products');
      });
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.startCheckout();
      });
    }
  },

  /**
   * Set up event listeners for cart items
   */
  setupCartItemListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.cart-item .decrease-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const input = document.querySelector(`.cart-item .quantity-input[data-id="${productId}"]`);
        let value = parseInt(input.value);
        
        if (value > 1) {
          value--;
          input.value = value;
          this.updateCartItemQuantity(productId, value);
        }
      });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.cart-item .increase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const input = document.querySelector(`.cart-item .quantity-input[data-id="${productId}"]`);
        let value = parseInt(input.value);
        const item = this.items.find(item => item.productId === productId);
        
        if (value < item.product.stock) {
          value++;
          input.value = value;
          this.updateCartItemQuantity(productId, value);
        }
      });
    });
    
    // Quantity input fields
    document.querySelectorAll('.cart-item .quantity-input').forEach(input => {
      input.addEventListener('change', () => {
        const productId = input.dataset.id;
        let value = parseInt(input.value);
        const item = this.items.find(item => item.productId === productId);
        
        if (isNaN(value) || value < 1) {
          value = 1;
          input.value = value;
        } else if (value > item.product.stock) {
          value = item.product.stock;
          input.value = value;
        }
        
        this.updateCartItemQuantity(productId, value);
      });
    });
    
    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        
        if (confirm('この商品をカートから削除してもよろしいですか？')) {
          this.removeFromCart(productId);
        }
      });
    });
  },

  /**
   * Start checkout process
   */
  startCheckout() {
    if (!Auth.isAuthenticated()) {
      alert('注文手続きを行うにはログインしてください。');
      Auth.showLoginModal();
      return;
    }
    
    if (this.items.length === 0) {
      alert('カートに商品がありません。');
      return;
    }
    
    // Show checkout modal
    const modal = document.getElementById('checkout-modal');
    
    if (!modal) {
      return;
    }
    
    // Reset checkout steps
    document.querySelectorAll('.checkout-step-content').forEach(step => {
      step.classList.remove('active');
    });
    
    document.querySelectorAll('.checkout-steps .step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show shipping step
    document.getElementById('shipping-step').classList.add('active');
    document.querySelector('.checkout-steps .step[data-step="shipping"]').classList.add('active');
    
    // Load shipping step content
    this.loadShippingStep();
    
    // Show modal
    modal.style.display = 'block';
  },

  /**
   * Load shipping step content
   */
  loadShippingStep() {
    const shippingStep = document.getElementById('shipping-step');
    
    if (!shippingStep) {
      return;
    }
    
    // Get user addresses
    const addresses = Auth.currentUser.addresses || [];
    
    if (addresses.length === 0) {
      shippingStep.innerHTML = `
        <p>配送先住所が登録されていません。</p>
        <button class="btn btn-primary" id="checkout-add-address-btn">新しい住所を追加</button>
      `;
      
      // Add event listener for add address button
      document.getElementById('checkout-add-address-btn').addEventListener('click', () => {
        Auth.showAddressModal();
      });
      
      return;
    }
    
    // Render addresses
    shippingStep.innerHTML = `
      <h3>配送先住所を選択</h3>
      <div class="checkout-addresses">
        ${addresses.map(address => `
          <div class="checkout-address ${address.isDefault ? 'selected' : ''}" data-id="${address._id}">
            <div class="checkout-address-radio">
              <input type="radio" name="shipping-address" id="address-${address._id}" ${address.isDefault ? 'checked' : ''}>
              <label for="address-${address._id}"></label>
            </div>
            <div class="checkout-address-details">
              <div class="checkout-address-name">${address.name}</div>
              <div>${address.phone}</div>
              <div>${address.postalCode}</div>
              <div>${address.city} ${address.address}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn" id="checkout-add-address-btn">新しい住所を追加</button>
      <div class="checkout-actions">
        <button class="btn" id="checkout-cancel-btn">キャンセル</button>
        <button class="btn btn-primary" id="checkout-next-btn">次へ</button>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('checkout-add-address-btn').addEventListener('click', () => {
      Auth.showAddressModal();
    });
    
    document.getElementById('checkout-cancel-btn').addEventListener('click', () => {
      document.getElementById('checkout-modal').style.display = 'none';
    });
    
    document.getElementById('checkout-next-btn').addEventListener('click', () => {
      this.proceedToPaymentStep();
    });
    
    // Add event listeners for address selection
    document.querySelectorAll('.checkout-address').forEach(addressEl => {
      addressEl.addEventListener('click', () => {
        // Unselect all addresses
        document.querySelectorAll('.checkout-address').forEach(el => {
          el.classList.remove('selected');
          el.querySelector('input[type="radio"]').checked = false;
        });
        
        // Select clicked address
        addressEl.classList.add('selected');
        addressEl.querySelector('input[type="radio"]').checked = true;
      });
    });
  },

  /**
   * Proceed to payment step
   */
  proceedToPaymentStep() {
    // Check if shipping address is selected
    const selectedAddress = document.querySelector('.checkout-address.selected');
    
    if (!selectedAddress) {
      alert('配送先住所を選択してください。');
      return;
    }
    
    // Get selected address ID
    const addressId = selectedAddress.dataset.id;
    
    // Store selected address ID for later use
    this.selectedAddressId = addressId;
    
    // Update checkout steps
    document.querySelectorAll('.checkout-step-content').forEach(step => {
      step.classList.remove('active');
    });
    
    document.querySelectorAll('.checkout-steps .step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show payment step
    document.getElementById('payment-step').classList.add('active');
    document.querySelector('.checkout-steps .step[data-step="payment"]').classList.add('active');
    
    // Load payment step content
    this.loadPaymentStep();
  },

  /**
   * Load payment step content
   */
  loadPaymentStep() {
    const paymentStep = document.getElementById('payment-step');
    
    if (!paymentStep) {
      return;
    }
    
    // Render payment options
    paymentStep.innerHTML = `
      <h3>支払い方法を選択</h3>
      <div class="payment-options">
        <div class="payment-option selected" data-method="credit_card">
          <div class="payment-option-radio">
            <input type="radio" name="payment-method" id="payment-credit-card" checked>
            <label for="payment-credit-card"></label>
          </div>
          <div class="payment-option-details">
            <div class="payment-option-name">クレジットカード</div>
            <div class="payment-option-description">
              <div class="credit-card-icons">
                <i class="fab fa-cc-visa"></i>
                <i class="fab fa-cc-mastercard"></i>
                <i class="fab fa-cc-amex"></i>
                <i class="fab fa-cc-jcb"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="payment-option" data-method="bank_transfer">
          <div class="payment-option-radio">
            <input type="radio" name="payment-method" id="payment-bank-transfer">
            <label for="payment-bank-transfer"></label>
          </div>
          <div class="payment-option-details">
            <div class="payment-option-name">銀行振込</div>
            <div class="payment-option-description">
              注文確認後、振込先情報をメールでお送りします。
            </div>
          </div>
        </div>
        <div class="payment-option" data-method="cash_on_delivery">
          <div class="payment-option-radio">
            <input type="radio" name="payment-method" id="payment-cash-on-delivery">
            <label for="payment-cash-on-delivery"></label>
          </div>
          <div class="payment-option-details">
            <div class="payment-option-name">代金引換</div>
            <div class="payment-option-description">
              商品お届け時に配送員に代金をお支払いください。
            </div>
          </div>
        </div>
      </div>
      <div class="checkout-actions">
        <button class="btn" id="payment-back-btn">戻る</button>
        <button class="btn btn-primary" id="payment-next-btn">次へ</button>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('payment-back-btn').addEventListener('click', () => {
      // Go back to shipping step
      document.querySelectorAll('.checkout-step-content').forEach(step => {
        step.classList.remove('active');
      });
      
      document.querySelectorAll('.checkout-steps .step').forEach(step => {
        step.classList.remove('active');
      });
      
      document.getElementById('shipping-step').classList.add('active');
      document.querySelector('.checkout-steps .step[data-step="shipping"]').classList.add('active');
    });
    
    document.getElementById('payment-next-btn').addEventListener('click', () => {
      this.proceedToConfirmStep();
    });
    
    // Add event listeners for payment option selection
    document.querySelectorAll('.payment-option').forEach(optionEl => {
      optionEl.addEventListener('click', () => {
        // Unselect all options
        document.querySelectorAll('.payment-option').forEach(el => {
          el.classList.remove('selected');
          el.querySelector('input[type="radio"]').checked = false;
        });
        
        // Select clicked option
        optionEl.classList.add('selected');
        optionEl.querySelector('input[type="radio"]').checked = true;
      });
    });
  },

  /**
   * Proceed to confirm step
   */
  proceedToConfirmStep() {
    // Check if payment method is selected
    const selectedPayment = document.querySelector('.payment-option.selected');
    
    if (!selectedPayment) {
      alert('支払い方法を選択してください。');
      return;
    }
    
    // Get selected payment method
    const paymentMethod = selectedPayment.dataset.method;
    
    // Store selected payment method for later use
    this.selectedPaymentMethod = paymentMethod;
    
    // Update checkout steps
    document.querySelectorAll('.checkout-step-content').forEach(step => {
      step.classList.remove('active');
    });
    
    document.querySelectorAll('.checkout-steps .step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show confirm step
    document.getElementById('confirm-step').classList.add('active');
    document.querySelector('.checkout-steps .step[data-step="confirm"]').classList.add('active');
    
    // Load confirm step content
    this.loadConfirmStep();
  },

  /**
   * Load confirm step content
   */
  loadConfirmStep() {
    const confirmStep = document.getElementById('confirm-step');
    
    if (!confirmStep) {
      return;
    }
    
    // Get selected address
    const address = Auth.currentUser.addresses.find(addr => addr._id === this.selectedAddressId);
    
    if (!address) {
      alert('配送先住所が見つかりませんでした。');
      return;
    }
    
    // Get payment method name
    let paymentMethodName = '';
    switch (this.selectedPaymentMethod) {
      case 'credit_card':
        paymentMethodName = 'クレジットカード';
        break;
      case 'bank_transfer':
        paymentMethodName = '銀行振込';
        break;
      case 'cash_on_delivery':
        paymentMethodName = '代金引換';
        break;
    }
    
    // Calculate totals
    const subtotal = this.calculateTotal();
    const shipping = 500; // Fixed shipping cost
    const total = subtotal + shipping;
    
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
    
    // Render confirm step
    confirmStep.innerHTML = `
      <h3>注文内容の確認</h3>
      <div class="confirm-section">
        <h4>配送先住所</h4>
        <div class="confirm-address">
          <div>${address.name}</div>
          <div>${address.phone}</div>
          <div>${address.postalCode}</div>
          <div>${address.city} ${address.address}</div>
        </div>
      </div>
      <div class="confirm-section">
        <h4>支払い方法</h4>
        <div>${paymentMethodName}</div>
      </div>
      <div class="confirm-section">
        <h4>注文商品</h4>
        <div class="confirm-items">
          ${this.items.map(item => `
            <div class="confirm-item">
              <div class="confirm-item-name">${item.product.name}</div>
              <div class="confirm-item-quantity">${item.quantity}${item.product.unit}</div>
              <div class="confirm-item-price">${new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(item.product.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="confirm-section">
        <h4>合計金額</h4>
        <div class="confirm-total">
          <div class="confirm-total-row">
            <span>小計:</span>
            <span>${formattedSubtotal}</span>
          </div>
          <div class="confirm-total-row">
            <span>配送料:</span>
            <span>${formattedShipping}</span>
          </div>
          <div class="confirm-total-row total">
            <span>合計:</span>
            <span>${formattedTotal}</span>
          </div>
        </div>
      </div>
      <div class="checkout-actions">
        <button class="btn" id="confirm-back-btn">戻る</button>
        <button class="btn btn-primary" id="confirm-order-btn">注文を確定する</button>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('confirm-back-btn').addEventListener('click', () => {
      // Go back to payment step
      document.querySelectorAll('.checkout-step-content').forEach(step => {
        step.classList.remove('active');
      });
      
      document.querySelectorAll('.checkout-steps .step').forEach(step => {
        step.classList.remove('active');
      });
      
      document.getElementById('payment-step').classList.add('active');
      document.querySelector('.checkout-steps .step[data-step="payment"]').classList.add('active');
    });
    
    document.getElementById('confirm-order-btn').addEventListener('click', () => {
      this.placeOrder();
    });
  },

  /**
   * Place order
   */
  async placeOrder() {
    try {
      // Get selected address
      const address = Auth.currentUser.addresses.find(addr => addr._id === this.selectedAddressId);
      
      if (!address) {
        throw new Error('配送先住所が見つかりませんでした。');
      }
      
      // Prepare order items
      const items = this.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        shippingAddress: {
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          postalCode: address.postalCode
        }
      }));
      
      // Create order
      const orderData = {
        items,
        paymentMethod: this.selectedPaymentMethod
      };
      
      // Send order to API
      const order = await API.orders.create(orderData);
      
      // Close checkout modal
      document.getElementById('checkout-modal').style.display = 'none';
      
      // Clear cart
      this.clearCart();
      
      // Show success message
      alert('ご注文ありがとうございます。注文が完了しました。');
      
      // Navigate to orders tab
      App.showTab('orders');
      
      // Reload orders
      OrdersModule.loadOrders();
    } catch (error) {
      console.error('Place order error:', error);
      alert(`注文の処理中にエラーが発生しました: ${error.message}`);
    }
  }
};
