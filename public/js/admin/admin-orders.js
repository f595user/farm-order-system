/**
 * Admin Orders Module
 * Handles order management functionality
 */
const AdminOrders = {
  /**
   * Load orders
   */
  async loadOrders() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch orders
      AdminCore.orders = await API.admin.getOrders();
      
      // Render orders
      this.renderOrders();
    } catch (error) {
      console.error('Load orders error:', error);
      document.getElementById('admin-orders').innerHTML = '<p>注文の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render orders
   */
  renderOrders() {
    const ordersPanel = document.getElementById('admin-orders');
    
    if (!ordersPanel) {
      return;
    }
    
    // Create orders content
    ordersPanel.innerHTML = `
      <div class="admin-filters">
        <div class="filter-group">
          <label for="order-status-filter">ステータス:</label>
          <select id="order-status-filter">
            <option value="">すべて</option>
            <option value="pending">受付中</option>
            <option value="processing">準備中</option>
            <option value="shipped">発送済み</option>
            <option value="delivered">配達済み</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="order-payment-filter">支払い状況:</label>
          <select id="order-payment-filter">
            <option value="">すべて</option>
            <option value="pending">未払い</option>
            <option value="paid">支払い済み</option>
            <option value="failed">支払い失敗</option>
            <option value="refunded">返金済み</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="order-search">検索:</label>
          <input type="text" id="order-search" placeholder="顧客名、メール、注文番号">
        </div>
        <button class="btn" id="apply-order-filters">適用</button>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>注文番号</th>
            <th>顧客</th>
            <th>日時</th>
            <th>金額</th>
            <th>支払い状況</th>
            <th>注文状態</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${AdminCore.orders.map(order => `
            <tr>
              <td>${order._id}</td>
              <td>${order.user ? order.user.name : '不明'}</td>
              <td>${new Date(order.createdAt).toLocaleString('ja-JP')}</td>
              <td>${new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(order.totalAmount)}</td>
              <td>${AdminCore.getPaymentStatusText(order.paymentStatus)}</td>
              <td>${AdminCore.getStatusText(order.status)}</td>
              <td>
                <div class="admin-actions">
                  <button class="btn view-order-btn" data-id="${order._id}">詳細</button>
                  <button class="btn update-status-btn" data-id="${order._id}">状態更新</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Add event listeners
    this.setupOrdersEventListeners();
  },

  /**
   * Set up orders event listeners
   */
  setupOrdersEventListeners() {
    // View order buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        this.viewOrderDetails(orderId);
      });
    });
    
    // Update status buttons
    document.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        this.showUpdateStatusModal(orderId);
      });
    });
    
    // Apply filters button
    document.getElementById('apply-order-filters').addEventListener('click', () => {
      this.applyOrderFilters();
    });
  },

  /**
   * Apply order filters
   */
  async applyOrderFilters() {
    try {
      const statusFilter = document.getElementById('order-status-filter').value;
      const paymentFilter = document.getElementById('order-payment-filter').value;
      const searchFilter = document.getElementById('order-search').value;
      
      // Fetch filtered orders
      AdminCore.orders = await API.admin.getOrders({
        status: statusFilter,
        paymentStatus: paymentFilter,
        search: searchFilter
      });
      
      // Render orders
      this.renderOrders();
    } catch (error) {
      console.error('Apply order filters error:', error);
      alert('注文フィルターの適用に失敗しました。');
    }
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
      modal.id = 'admin-order-modal';
      
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
      const statusClass = AdminCore.getStatusClass(order.status);
      const statusText = AdminCore.getStatusText(order.status);
      
      // Get payment status text
      const paymentStatusText = AdminCore.getPaymentStatusText(order.paymentStatus);
      
      // Get payment method text
      const paymentMethodText = AdminCore.getPaymentMethodText(order.paymentMethod);
      
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
              <h3>顧客情報</h3>
              <div class="order-details-customer">
                <div class="order-details-customer-name">名前: ${order.user.name}</div>
                <div class="order-details-customer-email">メール: ${order.user.email}</div>
              </div>
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
            <div class="order-details-actions">
              <button class="btn update-status-btn" data-id="${order._id}">状態更新</button>
              <button class="btn update-payment-btn" data-id="${order._id}">支払い状況更新</button>
              <button class="btn update-shipping-btn" data-id="${order._id}">配送情報更新</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Add event listeners for action buttons
      modal.querySelector('.update-status-btn').addEventListener('click', () => {
        this.showUpdateStatusModal(orderId);
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('.update-payment-btn').addEventListener('click', () => {
        this.showUpdatePaymentModal(orderId);
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('.update-shipping-btn').addEventListener('click', () => {
        this.showUpdateShippingModal(orderId);
        modal.style.display = 'none';
        modal.remove();
      });
      
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
   * Show update status modal
   * @param {string} orderId - Order ID
   */
  async showUpdateStatusModal(orderId) {
    try {
      // Fetch order details
      const order = await API.orders.getById(orderId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'update-status-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>注文状態の更新</h2>
          <div class="update-status-form">
            <div class="form-group">
              <label for="order-status">注文状態:</label>
              <select id="order-status">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>受付中</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>準備中</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>発送済み</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>配達済み</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>キャンセル</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-update-status">キャンセル</button>
              <button class="btn btn-primary" id="save-update-status" data-id="${orderId}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-update-status').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-update-status').addEventListener('click', async () => {
        const status = document.getElementById('order-status').value;
        await this.updateOrderStatus(orderId, status);
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show update status modal error:', error);
      alert('注文状態の更新モーダルの表示に失敗しました。');
    }
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   */
  async updateOrderStatus(orderId, status) {
    try {
      // Update order status
      await API.admin.updateOrderStatus(orderId, status);
      
      // Reload orders
      await this.loadOrders();
      
      // Show success message
      alert('注文状態を更新しました。');
    } catch (error) {
      console.error('Update order status error:', error);
      alert(`注文状態の更新に失敗しました: ${error.message}`);
    }
  },

  /**
   * Show update payment modal
   * @param {string} orderId - Order ID
   */
  async showUpdatePaymentModal(orderId) {
    try {
      // Fetch order details
      const order = await API.orders.getById(orderId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'update-payment-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>支払い状況の更新</h2>
          <div class="update-payment-form">
            <div class="form-group">
              <label for="payment-status">支払い状況:</label>
              <select id="payment-status">
                <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>未払い</option>
                <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>支払い済み</option>
                <option value="failed" ${order.paymentStatus === 'failed' ? 'selected' : ''}>支払い失敗</option>
                <option value="refunded" ${order.paymentStatus === 'refunded' ? 'selected' : ''}>返金済み</option>
              </select>
            </div>
            <div class="form-group">
              <label for="transaction-id">取引ID:</label>
              <input type="text" id="transaction-id" value="${order.paymentDetails && order.paymentDetails.transactionId ? order.paymentDetails.transactionId : ''}">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-update-payment">キャンセル</button>
              <button class="btn btn-primary" id="save-update-payment" data-id="${orderId}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-update-payment').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-update-payment').addEventListener('click', async () => {
        const paymentStatus = document.getElementById('payment-status').value;
        const transactionId = document.getElementById('transaction-id').value;
        await this.updatePaymentStatus(orderId, paymentStatus, transactionId);
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show update payment modal error:', error);
      alert('支払い状況の更新モーダルの表示に失敗しました。');
    }
  },

  /**
   * Update payment status
   * @param {string} orderId - Order ID
   * @param {string} paymentStatus - New payment status
   * @param {string} transactionId - Transaction ID
   */
  async updatePaymentStatus(orderId, paymentStatus, transactionId) {
    try {
      // Update payment status
      await API.admin.updatePaymentStatus(orderId, paymentStatus, transactionId);
      
      // Reload orders
      await this.loadOrders();
      
      // Show success message
      alert('支払い状況を更新しました。');
    } catch (error) {
      console.error('Update payment status error:', error);
      alert(`支払い状況の更新に失敗しました: ${error.message}`);
    }
  },

  /**
   * Show update shipping modal
   * @param {string} orderId - Order ID
   */
  async showUpdateShippingModal(orderId) {
    try {
      // Fetch order details
      const order = await API.orders.getById(orderId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'update-shipping-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>配送情報の更新</h2>
          <div class="update-shipping-form">
            <div class="form-group">
              <label for="shipping-carrier">配送業者:</label>
              <input type="text" id="shipping-carrier" value="${order.shippingDetails && order.shippingDetails.carrier ? order.shippingDetails.carrier : ''}">
            </div>
            <div class="form-group">
              <label for="tracking-number">追跡番号:</label>
              <input type="text" id="tracking-number" value="${order.shippingDetails && order.shippingDetails.trackingNumber ? order.shippingDetails.trackingNumber : ''}">
            </div>
            <div class="form-group">
              <label for="estimated-delivery">配送予定日:</label>
              <input type="date" id="estimated-delivery" value="${order.shippingDetails && order.shippingDetails.estimatedDelivery ? new Date(order.shippingDetails.estimatedDelivery).toISOString().split('T')[0] : ''}">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-update-shipping">キャンセル</button>
              <button class="btn btn-primary" id="save-update-shipping" data-id="${orderId}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-update-shipping').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-update-shipping').addEventListener('click', async () => {
        const carrier = document.getElementById('shipping-carrier').value;
        const trackingNumber = document.getElementById('tracking-number').value;
        const estimatedDelivery = document.getElementById('estimated-delivery').value;
        
        const shippingDetails = {
          carrier,
          trackingNumber,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
        };
        
        await this.updateShippingDetails(orderId, shippingDetails);
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show update shipping modal error:', error);
      alert('配送情報の更新モーダルの表示に失敗しました。');
    }
  },

  /**
   * Update shipping details
   * @param {string} orderId - Order ID
   * @param {Object} shippingDetails - Shipping details
   */
  async updateShippingDetails(orderId, shippingDetails) {
    try {
      // Update shipping details
      await API.admin.updateShippingDetails(orderId, shippingDetails);
      
      // Reload orders
      await this.loadOrders();
      
      // Show success message
      alert('配送情報を更新しました。');
    } catch (error) {
      console.error('Update shipping details error:', error);
      alert(`配送情報の更新に失敗しました: ${error.message}`);
    }
  }
};
