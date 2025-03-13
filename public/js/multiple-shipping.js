/**
 * Multiple Shipping Module
 * Extends cart functionality to support multiple shipping addresses
 */
const MultipleShippingModule = {
  /**
   * Shipping addresses for each cart item
   * Object with product ID as key and address ID as value
   */
  itemAddresses: {},

  /**
   * Initialize multiple shipping module
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Override checkout button event listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      // Remove existing event listeners
      const newCheckoutBtn = checkoutBtn.cloneNode(true);
      checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
      
      // Add new event listener
      newCheckoutBtn.addEventListener('click', () => {
        this.startMultipleShippingCheckout();
      });
    }
  },

  /**
   * Start multiple shipping checkout process
   */
  startMultipleShippingCheckout() {
    if (!Auth.isAuthenticated()) {
      alert('注文手続きを行うにはログインしてください。');
      Auth.showLoginModal();
      return;
    }
    
    if (CartModule.items.length === 0) {
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
    
    // Load multiple shipping step content
    this.loadMultipleShippingStep();
    
    // Show modal
    modal.style.display = 'block';
  },

  /**
   * Load multiple shipping step content
   */
  loadMultipleShippingStep() {
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
    
    // Initialize item addresses if empty
    CartModule.items.forEach(item => {
      if (!this.itemAddresses[item.productId]) {
        // Set default address for each item
        const defaultAddress = addresses.find(addr => addr.isDefault);
        this.itemAddresses[item.productId] = defaultAddress ? defaultAddress._id : addresses[0]._id;
      }
    });
    
    // Render multiple shipping form
    shippingStep.innerHTML = `
      <h3>配送先住所を選択</h3>
      <p>商品ごとに配送先を選択できます。</p>
      
      <div class="multiple-shipping-items">
        ${CartModule.items.map(item => {
          // Format price with Japanese Yen
          const formattedPrice = new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
          }).format(item.product.price);
          
          return `
            <div class="multiple-shipping-item" data-id="${item.productId}">
              <div class="multiple-shipping-item-info">
                <div class="multiple-shipping-item-name">${item.product.name}</div>
                <div class="multiple-shipping-item-price">${formattedPrice} × ${item.quantity}</div>
              </div>
              <div class="multiple-shipping-item-address">
                <label>配送先:</label>
                <select class="address-select" data-product-id="${item.productId}">
                  ${addresses.map(address => `
                    <option value="${address._id}" ${this.itemAddresses[item.productId] === address._id ? 'selected' : ''}>
                      ${address.name} - ${address.city} ${address.address}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          `;
        }).join('')}
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
    document.querySelectorAll('.address-select').forEach(select => {
      select.addEventListener('change', () => {
        const productId = select.dataset.productId;
        this.itemAddresses[productId] = select.value;
      });
    });
  },

  /**
   * Proceed to payment step
   */
  proceedToPaymentStep() {
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
    
    // Load payment step content (reuse CartModule's method)
    CartModule.loadPaymentStep();
    
    // Override next button event listener
    const nextBtn = document.getElementById('payment-next-btn');
    if (nextBtn) {
      // Remove existing event listeners
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
      
      // Add new event listener
      newNextBtn.addEventListener('click', () => {
        this.proceedToConfirmStep();
      });
    }
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
    CartModule.selectedPaymentMethod = paymentMethod;
    
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
    this.loadMultipleShippingConfirmStep();
  },

  /**
   * Load multiple shipping confirm step content
   */
  loadMultipleShippingConfirmStep() {
    const confirmStep = document.getElementById('confirm-step');
    
    if (!confirmStep) {
      return;
    }
    
    // Get all addresses
    const addresses = Auth.currentUser.addresses || [];
    
    // Get payment method name
    let paymentMethodName = '';
    switch (CartModule.selectedPaymentMethod) {
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
    const subtotal = CartModule.calculateTotal();
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
        <h4>支払い方法</h4>
        <div>${paymentMethodName}</div>
      </div>
      <div class="confirm-section">
        <h4>注文商品と配送先</h4>
        <div class="confirm-items">
          ${CartModule.items.map(item => {
            const addressId = this.itemAddresses[item.productId];
            const address = addresses.find(addr => addr._id === addressId);
            
            return `
              <div class="confirm-item">
                <div class="confirm-item-details">
                  <div class="confirm-item-name">${item.product.name}</div>
                  <div class="confirm-item-quantity">${item.quantity}${item.product.unit}</div>
                  <div class="confirm-item-price">${new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(item.product.price * item.quantity)}</div>
                </div>
                <div class="confirm-item-address">
                  <div class="confirm-address-label">配送先:</div>
                  <div class="confirm-address-details">
                    <div>${address.name}</div>
                    <div>${address.phone}</div>
                    <div>${address.postalCode}</div>
                    <div>${address.city} ${address.address}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
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
      this.placeMultipleShippingOrder();
    });
  },

  /**
   * Place multiple shipping order
   */
  async placeMultipleShippingOrder() {
    try {
      // Get all addresses
      const addresses = Auth.currentUser.addresses || [];
      
      // Prepare order items
      const items = CartModule.items.map(item => {
        const addressId = this.itemAddresses[item.productId];
        const address = addresses.find(addr => addr._id === addressId);
        
        if (!address) {
          throw new Error('配送先住所が見つかりませんでした。');
        }
        
        return {
          product: item.productId,
          quantity: item.quantity,
          shippingAddress: {
            name: address.name,
            phone: address.phone,
            address: address.address,
            city: address.city,
            postalCode: address.postalCode
          }
        };
      });
      
      // Create order
      const orderData = {
        items,
        paymentMethod: CartModule.selectedPaymentMethod
      };
      
      // Send order to API
      const order = await API.orders.create(orderData);
      
      // Close checkout modal
      document.getElementById('checkout-modal').style.display = 'none';
      
      // Clear cart
      CartModule.clearCart();
      
      // Reset item addresses
      this.itemAddresses = {};
      
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

// Initialize multiple shipping module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize after CartModule is initialized
  setTimeout(() => {
    MultipleShippingModule.init();
  }, 500);
});
