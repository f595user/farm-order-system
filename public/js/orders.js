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
