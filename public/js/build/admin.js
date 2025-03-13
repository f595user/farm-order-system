/**
 * Admin Module
 * Main module for admin functionality
 * Acts as a bridge between the app and the admin modules
 */
const AdminModule = {
  /**
   * Flag to track initialization status
   */
  _initialized: false,
  
  /**
   * Initialize admin module
   */
  async init() {
    console.log('Admin module initialized');
    // Initialize AdminCore which will set up event listeners and load dashboard
    await AdminCore.init();
    // Set initialization flag
    this._initialized = true;
  },

  /**
   * Show admin tab - delegates to AdminCore
   * @param {string} tabName - Tab name
   */
  showAdminTab(tabName) {
    if (AdminCore && typeof AdminCore.showAdminTab === 'function') {
      AdminCore.showAdminTab(tabName);
    } else {
      console.error('AdminCore not available or showAdminTab not defined');
    }
  },

  /**
   * Load dashboard data - delegates to AdminDashboard
   */
  loadDashboard() {
    if (AdminDashboard && typeof AdminDashboard.loadDashboard === 'function') {
      AdminDashboard.loadDashboard();
    } else {
      console.error('AdminDashboard not available or loadDashboard not defined');
    }
  },

  /**
   * Load orders data - delegates to AdminOrders
   */
  loadOrders() {
    if (AdminOrders && typeof AdminOrders.loadOrders === 'function') {
      AdminOrders.loadOrders();
    } else {
      console.error('AdminOrders not available or loadOrders not defined');
    }
  },

  /**
   * Load products data - delegates to AdminProducts
   */
  loadProducts() {
    if (AdminProducts && typeof AdminProducts.loadProducts === 'function') {
      AdminProducts.loadProducts();
    } else {
      console.error('AdminProducts not available or loadProducts not defined');
    }
  },

  /**
   * Load users data - delegates to AdminUsers
   */
  loadUsers() {
    if (AdminUsers && typeof AdminUsers.loadUsers === 'function') {
      AdminUsers.loadUsers();
    } else {
      console.error('AdminUsers not available or loadUsers not defined');
    }
  },

  /**
   * Load reports data - delegates to AdminReports
   */
  loadReports() {
    if (AdminReports && typeof AdminReports.loadReports === 'function') {
      AdminReports.loadReports();
    } else {
      console.error('AdminReports not available or loadReports not defined');
    }
  }
};

// Initialize admin module when document is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#admin')) {
    AdminModule.init();
  }
});

/**
 * Admin Core Module
 * Core functionality for the admin dashboard
 */
const AdminCore = {
  /**
   * Current admin data
   */
  dashboardData: null,
  users: [],
  orders: [],
  products: [],
  salesReport: null,
  productReport: null,

  /**
   * Initialize admin module
   */
  async init() {
    // Check if user is admin
    if (!Auth.isAdmin()) {
      return;
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load dashboard data
    await AdminDashboard.loadDashboard();
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    console.log('Setting up admin event listeners');
    try {
      // Admin tab buttons - make sure the admin section exists first
      const adminSection = document.getElementById('admin');
      if (!adminSection) {
        console.warn('Admin section not found in DOM. Skipping event listener setup.');
        return;
      }
      
      // Admin tab buttons - use a safer query selector that won't throw errors
      const adminTabButtons = adminSection.querySelectorAll('.admin-tab-btn');
      console.log('Found admin tab buttons:', adminTabButtons ? adminTabButtons.length : 0);
      
      if (adminTabButtons && adminTabButtons.length > 0) {
        adminTabButtons.forEach(btn => {
          if (btn && typeof btn.addEventListener === 'function') {
            console.log('Adding click listener to button:', btn.dataset.adminTab);
            btn.addEventListener('click', () => {
              console.log('Admin tab button clicked:', btn.dataset.adminTab);
              const tabName = btn.dataset.adminTab;
              this.showAdminTab(tabName);
            });
          }
        });
      } else {
        console.warn('No admin tab buttons found. Admin functionality may be limited.');
      }
    } catch (error) {
      console.error('Error setting up admin event listeners:', error);
    }
  },

  /**
   * Show admin tab
   * @param {string} tabName - Tab name
   */
  async showAdminTab(tabName) {
    try {
      // Make sure admin section exists
      const adminSection = document.getElementById('admin');
      if (!adminSection) {
        console.warn('Admin section not found in DOM. Cannot show tab.');
        return;
      }
      
      // Update active tab button - use adminSection to scope the query
      const tabButtons = adminSection.querySelectorAll('.admin-tab-btn');
      if (tabButtons && tabButtons.length > 0) {
        tabButtons.forEach(btn => {
          if (btn && typeof btn.classList !== 'undefined' && typeof btn.classList.remove === 'function') {
            btn.classList.remove('active');
          }
        });
      }
      
      const activeTabBtn = adminSection.querySelector(`.admin-tab-btn[data-admin-tab="${tabName}"]`);
      if (activeTabBtn && typeof activeTabBtn.classList !== 'undefined' && typeof activeTabBtn.classList.add === 'function') {
        activeTabBtn.classList.add('active');
      } else {
        console.warn(`Admin tab button for "${tabName}" not found or classList not available`);
      }
      
      // Update active tab panel - use adminSection to scope the query
      const tabPanels = adminSection.querySelectorAll('.admin-tab-panel');
      if (tabPanels && tabPanels.length > 0) {
        tabPanels.forEach(panel => {
          if (panel && typeof panel.classList !== 'undefined' && typeof panel.classList.remove === 'function') {
            panel.classList.remove('active');
          }
        });
      }
      
      const tabPanel = document.getElementById(`admin-${tabName}`);
      if (tabPanel && typeof tabPanel.classList !== 'undefined' && typeof tabPanel.classList.add === 'function') {
        tabPanel.classList.add('active');
      } else {
        console.warn(`Admin tab panel for "${tabName}" not found or classList not available`);
      }
      
      // Load tab content
      switch (tabName) {
        case 'dashboard':
          if (typeof AdminDashboard !== 'undefined' && typeof AdminDashboard.loadDashboard === 'function') {
            await AdminDashboard.loadDashboard();
          } else {
            console.warn('AdminDashboard module not available');
          }
          break;
        case 'orders':
          if (typeof AdminOrders !== 'undefined' && typeof AdminOrders.loadOrders === 'function') {
            await AdminOrders.loadOrders();
          } else {
            console.warn('AdminOrders module not available');
          }
          break;
        case 'products':
          if (typeof AdminProducts !== 'undefined' && typeof AdminProducts.loadProducts === 'function') {
            await AdminProducts.loadProducts();
          } else {
            console.warn('AdminProducts module not available');
          }
          break;
        case 'users':
          if (typeof AdminUsers !== 'undefined' && typeof AdminUsers.loadUsers === 'function') {
            await AdminUsers.loadUsers();
          } else {
            console.warn('AdminUsers module not available');
          }
          break;
        case 'reports':
          if (typeof AdminReports !== 'undefined' && typeof AdminReports.loadReports === 'function') {
            await AdminReports.loadReports();
          } else {
            console.warn('AdminReports module not available');
          }
          break;
      }
    } catch (error) {
      console.error(`Error showing admin tab "${tabName}":`, error);
    }
  },

  /**
   * Get status text
   * @param {string} status - Status code
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
        return '不明';
    }
  },

  /**
   * Get status class
   * @param {string} status - Status code
   * @returns {string} - Status class
   */
  getStatusClass(status) {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  },

  /**
   * Get payment status text
   * @param {string} paymentStatus - Payment status code
   * @returns {string} - Payment status text
   */
  getPaymentStatusText(paymentStatus) {
    switch (paymentStatus) {
      case 'pending':
        return '未払い';
      case 'paid':
        return '支払い済み';
      case 'failed':
        return '支払い失敗';
      case 'refunded':
        return '返金済み';
      default:
        return '不明';
    }
  },

  /**
   * Get payment method text
   * @param {string} paymentMethod - Payment method code
   * @returns {string} - Payment method text
   */
  getPaymentMethodText(paymentMethod) {
    switch (paymentMethod) {
      case 'credit_card':
        return 'クレジットカード';
      case 'bank_transfer':
        return '銀行振込';
      case 'cash_on_delivery':
        return '代金引換';
      default:
        return '不明';
    }
  },

  /**
   * Get category text
   * @param {string} category - Category code
   * @returns {string} - Category text
   */
  getCategoryText(category) {
    switch (category) {
      case 'アスパラ':
        return 'アスパラ';
      case 'はちみつ':
        return 'はちみつ';
      // Keep old categories for backward compatibility
      case 'vegetables':
        return '野菜';
      case 'fruits':
        return '果物';
      case 'grains':
        return '穀物';
      case 'dairy':
        return '乳製品';
      case 'other':
        return 'その他';
      default:
        return '不明';
    }
  }
};

/**
 * Admin Dashboard Module
 * Handles dashboard functionality
 */
const AdminDashboard = {
  /**
   * Load dashboard data
   */
  async loadDashboard() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch dashboard data
      AdminCore.dashboardData = await API.admin.getDashboard();
      
      // Render dashboard
      this.renderDashboard();
    } catch (error) {
      console.error('Load dashboard error:', error);
      document.getElementById('admin-dashboard').innerHTML = '<p>ダッシュボードの読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render dashboard
   */
  renderDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    
    if (!dashboard || !AdminCore.dashboardData) {
      return;
    }
    
    // Create dashboard content
    dashboard.innerHTML = `
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value">${AdminCore.dashboardData.orderStats.totalOrders}</div>
          <div class="stat-label">総注文数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${AdminCore.dashboardData.orderStats.pendingOrders}</div>
          <div class="stat-label">受付中の注文</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${AdminCore.dashboardData.orderStats.processingOrders}</div>
          <div class="stat-label">準備中の注文</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
          }).format(AdminCore.dashboardData.orderStats.totalRevenue)}</div>
          <div class="stat-label">総売上</div>
        </div>
      </div>
      
      <div class="admin-section">
        <h3>最近の注文</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>注文番号</th>
              <th>顧客</th>
              <th>日時</th>
              <th>金額</th>
              <th>状態</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            ${AdminCore.dashboardData.recentOrders.map(order => `
              <tr>
                <td>${order._id}</td>
                <td>${order.user ? order.user.name : '不明'}</td>
                <td>${new Date(order.createdAt).toLocaleString('ja-JP')}</td>
                <td>${new Intl.NumberFormat('ja-JP', {
                  style: 'currency',
                  currency: 'JPY'
                }).format(order.totalAmount)}</td>
                <td>${AdminCore.getStatusText(order.status)}</td>
                <td>
                  <div class="admin-actions">
                    <button class="btn view-order-btn" data-id="${order._id}">詳細</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <button class="btn" id="view-all-orders-btn">すべての注文を表示</button>
      </div>
      
      <div class="admin-section">
        <h3>在庫切れ間近の商品</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>カテゴリ</th>
              <th>在庫数</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            ${AdminCore.dashboardData.lowStockProducts.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${AdminCore.getCategoryText(product.category)}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>
                  <div class="admin-actions">
                    <button class="btn update-stock-btn" data-id="${product._id}">在庫更新</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <button class="btn" id="view-all-products-btn">すべての商品を表示</button>
      </div>
    `;
    
    // Add event listeners
    this.setupDashboardEventListeners();
  },

  /**
   * Set up dashboard event listeners
   */
  setupDashboardEventListeners() {
    // View order buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        AdminOrders.viewOrderDetails(orderId);
      });
    });
    
    // Update stock buttons
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProducts.showUpdateStockModal(productId);
      });
    });
    
    // View all orders button
    document.getElementById('view-all-orders-btn').addEventListener('click', () => {
      AdminCore.showAdminTab('orders');
    });
    
    // View all products button
    document.getElementById('view-all-products-btn').addEventListener('click', () => {
      AdminCore.showAdminTab('products');
    });
  }
};

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

/**
 * Admin Products Utilities Module
 * Handles product import/export functionality
 */
const AdminProductsUtils = {
  /**
   * Download import template
   */
  downloadImportTemplate() {
    try {
      // Create CSV content
      const csvContent = 'ID,商品名,説明,価格,在庫数,単位,カテゴリ,状態,発送までの目安,在庫アラートしきい値,画像URL\n' +
        ',新鮮なアスパラ,美味しいアスパラです。,300,50,kg,アスパラ,販売中,ご注文から3〜5日以内に発送,10,https://example.com/asparagus.jpg\n' +
        ',純粋なはちみつ,甘くて美味しいはちみつです。,200,30,kg,はちみつ,販売中,ご注文から3〜5日以内に発送,5,https://example.com/honey.jpg';
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'products_import_template.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download template error:', error);
      alert(`テンプレートのダウンロードに失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Import products from CSV
   */
  async importProducts() {
    try {
      const fileInput = document.getElementById('import-file');
      
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('インポートするCSVファイルを選択してください。');
        return;
      }
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          
          // Skip header row
          const dataRows = lines.slice(1).filter(line => line.trim() !== '');
          
          if (dataRows.length === 0) {
            alert('インポートするデータがありません。');
            return;
          }
          
          const updateExisting = document.getElementById('import-update-existing').checked;
          let importedCount = 0;
          let updatedCount = 0;
          let errorCount = 0;
          
          for (const row of dataRows) {
            try {
              // Parse CSV row (handle quoted values with commas)
              const values = [];
              let inQuotes = false;
              let currentValue = '';
              
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(currentValue);
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              
              values.push(currentValue); // Add the last value
              
              // Extract values
              const [id, name, description, price, stock, unit, category, status, shippingEstimate, lowStockThreshold, imagesStr] = values;
              
              // Validate required fields
              if (!name || !description || !price) {
                console.error('Required fields missing:', row);
                errorCount++;
                continue;
              }
              
              // Create product data
              const productData = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : 0,
                unit: unit ? unit.trim() : 'kg',
                category: category && ['アスパラ', 'はちみつ'].includes(category.trim()) 
                  ? category.trim() 
                  : 'アスパラ',
                status: status && ['販売中', '販売停止', '今季の販売は終了しました'].includes(status.trim())
                  ? status.trim()
                  : '販売中',
                shippingEstimate: shippingEstimate ? shippingEstimate.trim() : 'ご注文から3〜5日以内に発送',
                lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
                images: imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(url => url) : []
              };
              
              // Update or create product
              if (id && updateExisting) {
                await API.admin.updateProduct(id.trim(), productData);
                updatedCount++;
              } else {
                await API.admin.createProduct(productData);
                importedCount++;
              }
            } catch (rowError) {
              console.error('Error processing row:', row, rowError);
              errorCount++;
            }
          }
          
          // Reload products
          await AdminProducts.loadProducts();
          
          // Show success message
          alert(`インポート完了: ${importedCount} 件追加, ${updatedCount} 件更新, ${errorCount} 件エラー`);
          
          // Close modal
          const modal = document.getElementById('import-modal');
          if (modal) {
            modal.style.display = 'none';
            modal.remove();
          }
        } catch (parseError) {
          console.error('CSV parse error:', parseError);
          alert(`CSVの解析に失敗しました: ${parseError.message}`);
        }
      };
      
      reader.onerror = () => {
        alert('ファイルの読み込みに失敗しました。');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import products error:', error);
      alert(`商品のインポートに失敗しました: ${error.message}`);
    }
  }
};

/**
 * Admin Product Modal Module
 * Handles product modal functionality for adding and editing products
 */
const AdminProductModal = {
  /**
   * Show product modal for adding or editing a product
   * @param {string} productId - Product ID for editing, null for adding
   */
  async showProductModal(productId = null) {
    try {
      let product = null;
      
      if (productId) {
        // Fetch product details for editing
        product = await API.products.getById(productId);
      }
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'product-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>${productId ? '商品の編集' : '新しい商品の追加'}</h2>
          <div class="product-form">
            <div class="form-group">
              <label for="product-name">商品名:</label>
              <input type="text" id="product-name" value="${product ? product.name : ''}">
            </div>
            <div class="form-group">
              <label for="product-description">説明:</label>
              <textarea id="product-description">${product ? product.description : ''}</textarea>
            </div>
            <div class="form-group">
              <label for="product-price">価格:</label>
              <input type="number" id="product-price" value="${product ? product.price : ''}" min="0">
            </div>
            <div class="form-group">
              <label for="product-stock">在庫数:</label>
              <input type="number" id="product-stock" value="${product ? product.stock : '0'}" min="0">
            </div>
            <div class="form-group">
              <label for="product-unit">単位:</label>
              <input type="text" id="product-unit" value="${product ? product.unit : 'kg'}">
            </div>
            <div class="form-group">
              <label for="product-category">カテゴリ:</label>
              <select id="product-category">
                <option value="アスパラ" ${product && product.category === 'アスパラ' ? 'selected' : ''}>アスパラ</option>
                <option value="はちみつ" ${product && product.category === 'はちみつ' ? 'selected' : ''}>はちみつ</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-status">状態:</label>
              <select id="product-status">
                <option value="販売中" ${!product || product.status === '販売中' ? 'selected' : ''}>販売中</option>
                <option value="販売停止" ${product && product.status === '販売停止' ? 'selected' : ''}>販売停止</option>
                <option value="今季の販売は終了しました" ${product && product.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-shipping-estimate">発送までの目安:</label>
              <input type="text" id="product-shipping-estimate" value="${product && product.shippingEstimate ? product.shippingEstimate : 'ご注文から3〜5日以内に発送'}">
              <div class="form-hint">例: ご注文から3〜5日以内に発送</div>
            </div>
            <div class="form-group">
              <label for="product-images">画像URL (カンマ区切り):</label>
              <input type="text" id="product-images" value="${product && product.images ? product.images.join(',') : ''}">
            </div>
            <div class="form-group">
              <label for="product-threshold">在庫アラートしきい値:</label>
              <input type="number" id="product-threshold" value="${product ? product.lowStockThreshold : '10'}" min="0">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-product">キャンセル</button>
              <button class="btn btn-primary" id="save-product" data-id="${productId || ''}">保存</button>
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
      
      modal.querySelector('#cancel-product').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-product').addEventListener('click', async () => {
        const productData = {
          name: document.getElementById('product-name').value,
          description: document.getElementById('product-description').value,
          price: parseFloat(document.getElementById('product-price').value),
          stock: parseInt(document.getElementById('product-stock').value),
          unit: document.getElementById('product-unit').value,
          category: document.getElementById('product-category').value,
          status: document.getElementById('product-status').value,
          shippingEstimate: document.getElementById('product-shipping-estimate').value,
          images: document.getElementById('product-images').value.split(',').map(url => url.trim()).filter(url => url),
          lowStockThreshold: parseInt(document.getElementById('product-threshold').value)
        };
        
        if (productId) {
          await AdminProducts.updateProduct(productId, productData);
        } else {
          await AdminProducts.createProduct(productData);
        }
        
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
      console.error('Show product modal error:', error);
      alert('商品モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show update stock modal
   * @param {string} productId - Product ID
   */
  async showUpdateStockModal(productId) {
    try {
      // Fetch product details
      const product = await API.products.getById(productId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'update-stock-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>在庫数の更新</h2>
          <div class="update-stock-form">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-category">${AdminCore.getCategoryText(product.category)}</div>
              <div class="product-stock">現在の在庫: ${product.stock} ${product.unit}</div>
            </div>
            <div class="form-group">
              <label for="stock-quantity">新しい在庫数:</label>
              <input type="number" id="stock-quantity" value="${product.stock}" min="0">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-update-stock">キャンセル</button>
              <button class="btn btn-primary" id="save-update-stock" data-id="${productId}">保存</button>
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
      
      modal.querySelector('#cancel-update-stock').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-update-stock').addEventListener('click', async () => {
        const stock = parseInt(document.getElementById('stock-quantity').value);
        await AdminProducts.updateProductStock(productId, stock);
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
      console.error('Show update stock modal error:', error);
      alert('在庫数の更新モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show shipping estimate modal
   * @param {string} productId - Product ID
   */
  async showShippingEstimateModal(productId) {
    try {
      // Fetch product details
      const product = await API.products.getById(productId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'shipping-estimate-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>発送までの目安の設定</h2>
          <div class="shipping-estimate-form">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-category">${AdminCore.getCategoryText(product.category)}</div>
              <div class="product-status">状態: ${product.status}</div>
            </div>
            <div class="form-group">
              <label for="shipping-estimate">発送までの目安:</label>
              <input type="text" id="shipping-estimate" value="${product.shippingEstimate || 'ご注文から3〜5日以内に発送'}">
              <div class="form-hint">例: ご注文から3〜5日以内に発送</div>
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-shipping-estimate">キャンセル</button>
              <button class="btn btn-primary" id="save-shipping-estimate" data-id="${productId}">保存</button>
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
      
      modal.querySelector('#cancel-shipping-estimate').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-shipping-estimate').addEventListener('click', async () => {
        const shippingEstimate = document.getElementById('shipping-estimate').value;
        await AdminProducts.updateShippingEstimate(productId, shippingEstimate);
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
      console.error('Show shipping estimate modal error:', error);
      alert('発送目安の設定モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show import modal
   */
  showImportModal() {
    try {
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'import-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>商品のインポート</h2>
          <div class="import-form">
            <p>CSVファイルから商品をインポートします。CSVファイルは以下の列を含む必要があります：</p>
            <ul>
              <li>商品名 (必須)</li>
              <li>説明 (必須)</li>
              <li>価格 (必須)</li>
              <li>在庫数</li>
              <li>単位</li>
              <li>カテゴリ (アスパラ, はちみつ のいずれか)</li>
              <li>状態 (販売中, 販売停止, 今季の販売は終了しました)</li>
              <li>発送までの目安</li>
              <li>在庫アラートしきい値</li>
              <li>画像URL (カンマ区切り)</li>
            </ul>
            <div class="form-group">
              <label for="import-file">CSVファイル:</label>
              <input type="file" id="import-file" accept=".csv">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="import-update-existing">
                既存の商品を更新する (IDで一致する場合)
              </label>
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-import">キャンセル</button>
              <button class="btn btn-primary" id="start-import">インポート</button>
            </div>
            <div class="import-template">
              <a href="#" id="download-template">インポート用テンプレートをダウンロード</a>
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
      
      modal.querySelector('#cancel-import').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Download template
      modal.querySelector('#download-template').addEventListener('click', (e) => {
        e.preventDefault();
        AdminProducts.downloadImportTemplate();
      });
      
      // Start import
      modal.querySelector('#start-import').addEventListener('click', () => {
        AdminProducts.importProducts();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show import modal error:', error);
      alert(`インポートモーダルの表示に失敗しました: ${error.message}`);
    }
  }
};

/**
 * Admin Products Module
 * Handles product management functionality
 */
const AdminProducts = {
  /**
   * Load products
   */
  async loadProducts() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch products
      AdminCore.products = await API.products.getAll();
      
      // Render products
      this.renderProducts();
    } catch (error) {
      console.error('Load products error:', error);
      document.getElementById('admin-products').innerHTML = '<p>商品の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Filter and sort products
   * @param {Array} products - Products to filter and sort
   * @param {Object} filters - Filter criteria
   * @param {Object} sort - Sort criteria
   * @returns {Array} - Filtered and sorted products
   */
  filterAndSortProducts(products, filters = {}, sort = { field: 'name', order: 'asc' }) {
    // Apply filters
    let filteredProducts = [...products];
    
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.status === filters.status);
    }
    
    if (filters.stock && filters.stock !== 'all') {
      if (filters.stock === 'inStock') {
        filteredProducts = filteredProducts.filter(product => product.stock > 0);
      } else if (filters.stock === 'outOfStock') {
        filteredProducts = filteredProducts.filter(product => product.stock === 0);
      } else if (filters.stock === 'lowStock') {
        filteredProducts = filteredProducts.filter(product => product.stock <= product.lowStockThreshold && product.stock > 0);
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
      let valueA, valueB;
      
      // Get values based on sort field
      switch (sort.field) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'stock':
          valueA = a.stock;
          valueB = b.stock;
          break;
        case 'category':
          valueA = a.category;
          valueB = b.category;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      // Compare values based on sort order
      if (sort.order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filteredProducts;
  },

  /**
   * Render products
   */
  renderProducts() {
    const productsPanel = document.getElementById('admin-products');
    
    if (!productsPanel) {
      return;
    }
    
    // Get filter and sort values from DOM if they exist
    const filters = {
      category: document.getElementById('product-category-filter')?.value || 'all',
      status: document.getElementById('product-status-filter')?.value || 'all',
      stock: document.getElementById('product-stock-filter')?.value || 'all',
      search: document.getElementById('product-search')?.value || ''
    };
    
    const sort = {
      field: document.getElementById('product-sort-field')?.value || 'name',
      order: document.getElementById('product-sort-order')?.value || 'asc'
    };
    
    // Filter and sort products
    const filteredProducts = this.filterAndSortProducts(AdminCore.products, filters, sort);
    
    // Create products content
    productsPanel.innerHTML = `
      <div class="admin-actions-top">
        <div class="admin-actions-left">
          <button class="btn btn-primary" id="add-product-btn">新しい商品を追加</button>
          <button class="btn" id="bulk-actions-btn">一括操作</button>
          <button class="btn" id="export-products-btn">エクスポート</button>
          <button class="btn" id="import-products-btn">インポート</button>
        </div>
        <div class="admin-actions-right">
          <span class="product-count">${filteredProducts.length} 件の商品</span>
        </div>
      </div>
      
      <div class="admin-filters">
        <div class="filter-group">
          <input type="text" id="product-search" placeholder="商品を検索..." value="${filters.search}">
        </div>
        <div class="filter-group">
          <select id="product-category-filter">
            <option value="all" ${filters.category === 'all' ? 'selected' : ''}>すべてのカテゴリ</option>
            <option value="アスパラ" ${filters.category === 'アスパラ' ? 'selected' : ''}>アスパラ</option>
            <option value="はちみつ" ${filters.category === 'はちみつ' ? 'selected' : ''}>はちみつ</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-status-filter">
            <option value="all" ${filters.status === 'all' ? 'selected' : ''}>すべての状態</option>
            <option value="販売中" ${filters.status === '販売中' ? 'selected' : ''}>販売中</option>
            <option value="販売停止" ${filters.status === '販売停止' ? 'selected' : ''}>販売停止</option>
            <option value="今季の販売は終了しました" ${filters.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-stock-filter">
            <option value="all" ${filters.stock === 'all' ? 'selected' : ''}>すべての在庫状態</option>
            <option value="inStock" ${filters.stock === 'inStock' ? 'selected' : ''}>在庫あり</option>
            <option value="outOfStock" ${filters.stock === 'outOfStock' ? 'selected' : ''}>在庫切れ</option>
            <option value="lowStock" ${filters.stock === 'lowStock' ? 'selected' : ''}>在庫少</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-sort-field">
            <option value="name" ${sort.field === 'name' ? 'selected' : ''}>商品名</option>
            <option value="price" ${sort.field === 'price' ? 'selected' : ''}>価格</option>
            <option value="stock" ${sort.field === 'stock' ? 'selected' : ''}>在庫数</option>
            <option value="category" ${sort.field === 'category' ? 'selected' : ''}>カテゴリ</option>
            <option value="createdAt" ${sort.field === 'createdAt' ? 'selected' : ''}>登録日</option>
          </select>
          <select id="product-sort-order">
            <option value="asc" ${sort.order === 'asc' ? 'selected' : ''}>昇順</option>
            <option value="desc" ${sort.order === 'desc' ? 'selected' : ''}>降順</option>
          </select>
        </div>
        <button class="btn" id="apply-product-filters">適用</button>
        <button class="btn" id="reset-product-filters">リセット</button>
      </div>
      
      <div class="bulk-actions-panel" style="display: none;">
        <div class="bulk-action-options">
          <select id="bulk-action-select">
            <option value="">一括操作を選択...</option>
            <option value="setOnSale">販売中に設定</option>
            <option value="setStopped">販売停止に設定</option>
            <option value="setSeasonEnded">今季の販売は終了しましたに設定</option>
            <option value="delete">削除</option>
            <option value="updateStock">在庫数更新</option>
          </select>
          <div id="bulk-stock-input" style="display: none;">
            <input type="number" id="bulk-stock-value" min="0" placeholder="新しい在庫数">
          </div>
          <button class="btn" id="apply-bulk-action">適用</button>
          <button class="btn" id="cancel-bulk-action">キャンセル</button>
        </div>
        <div class="bulk-action-info">
          <span>0 件選択中</span>
        </div>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" id="select-all-products">
            </th>
            <th>商品名</th>
            <th>カテゴリ</th>
            <th>価格</th>
            <th>在庫数</th>
            <th>状態</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${filteredProducts.length > 0 ? filteredProducts.map(product => `
            <tr class="${product.stock <= product.lowStockThreshold && product.stock > 0 ? 'low-stock' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}">
              <td>
                <input type="checkbox" class="product-select" data-id="${product._id}">
              </td>
              <td>${product.name}</td>
              <td>${AdminCore.getCategoryText(product.category)}</td>
              <td>${new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(product.price)}</td>
              <td>
                <div class="stock-display">
                  <span class="stock-value ${product.stock <= product.lowStockThreshold ? 'low-stock-text' : ''}">${product.stock}</span> ${product.unit}
                  <div class="quick-stock-update">
                    <button class="btn btn-small decrement-stock" data-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>-</button>
                    <button class="btn btn-small increment-stock" data-id="${product._id}">+</button>
                  </div>
                </div>
              </td>
              <td>
                <div class="status-display">
                  <select class="status-select" data-id="${product._id}">
                    <option value="販売中" ${product.status === '販売中' ? 'selected' : ''}>販売中</option>
                    <option value="販売停止" ${product.status === '販売停止' ? 'selected' : ''}>販売停止</option>
                    <option value="今季の販売は終了しました" ${product.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
                  </select>
                </div>
              </td>
              <td>
                <div class="admin-actions">
                  <button class="btn edit-product-btn" data-id="${product._id}">編集</button>
                  <button class="btn update-stock-btn" data-id="${product._id}">在庫更新</button>
                  <button class="btn shipping-estimate-btn" data-id="${product._id}">発送目安</button>
                  <button class="btn delete-product-btn" data-id="${product._id}">削除</button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="7" class="no-products">
                <p>商品が見つかりません。フィルターを変更するか、新しい商品を追加してください。</p>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    `;
    
    // Add event listeners
    this.setupProductsEventListeners();
  },

  /**
   * Set up products event listeners
   */
  setupProductsEventListeners() {
    // Add product button
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
      AdminProductModal.showProductModal();
    });
    
    // Edit product buttons
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showProductModal(productId);
      });
    });
    
    // Update stock buttons
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showUpdateStockModal(productId);
      });
    });
    
    // Shipping estimate buttons
    document.querySelectorAll('.shipping-estimate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showShippingEstimateModal(productId);
      });
    });
    
    // Delete product buttons
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        this.deleteProduct(productId);
      });
    });
    
    // Quick stock update buttons
    document.querySelectorAll('.increment-stock').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        const product = AdminCore.products.find(p => p._id === productId);
        if (product) {
          await this.updateProductStock(productId, product.stock + 1);
        }
      });
    });
    
    document.querySelectorAll('.decrement-stock').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        const product = AdminCore.products.find(p => p._id === productId);
        if (product && product.stock > 0) {
          await this.updateProductStock(productId, product.stock - 1);
        }
      });
    });
    
    // Status select
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async () => {
        const productId = select.dataset.id;
        const status = select.value;
        await this.updateProductStatus(productId, status);
      });
    });
    
    // Filter and sort controls
    document.getElementById('apply-product-filters')?.addEventListener('click', () => {
      this.renderProducts();
    });
    
    document.getElementById('reset-product-filters')?.addEventListener('click', () => {
      // Reset all filters and sort options
      if (document.getElementById('product-search')) {
        document.getElementById('product-search').value = '';
      }
      if (document.getElementById('product-category-filter')) {
        document.getElementById('product-category-filter').value = 'all';
      }
      if (document.getElementById('product-status-filter')) {
        document.getElementById('product-status-filter').value = 'all';
      }
      if (document.getElementById('product-stock-filter')) {
        document.getElementById('product-stock-filter').value = 'all';
      }
      if (document.getElementById('product-sort-field')) {
        document.getElementById('product-sort-field').value = 'name';
      }
      if (document.getElementById('product-sort-order')) {
        document.getElementById('product-sort-order').value = 'asc';
      }
      
      this.renderProducts();
    });
    
    // Bulk actions
    document.getElementById('bulk-actions-btn')?.addEventListener('click', () => {
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = bulkActionsPanel.style.display === 'none' ? 'flex' : 'none';
      }
    });
    
    document.getElementById('bulk-action-select')?.addEventListener('change', () => {
      const bulkAction = document.getElementById('bulk-action-select').value;
      const bulkStockInput = document.getElementById('bulk-stock-input');
      
      if (bulkAction === 'updateStock') {
        bulkStockInput.style.display = 'inline-block';
      } else {
        bulkStockInput.style.display = 'none';
      }
    });
    
    document.getElementById('apply-bulk-action')?.addEventListener('click', () => {
      this.applyBulkAction();
    });
    
    document.getElementById('cancel-bulk-action')?.addEventListener('click', () => {
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = 'none';
      }
      
      // Uncheck all checkboxes
      document.getElementById('select-all-products').checked = false;
      document.querySelectorAll('.product-select').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      this.updateSelectedCount();
    });
    
    // Select all products
    document.getElementById('select-all-products')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.product-select').forEach(checkbox => {
        checkbox.checked = isChecked;
      });
      
      this.updateSelectedCount();
    });
    
    // Individual product selection
    document.querySelectorAll('.product-select').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateSelectedCount();
        
        // Update "select all" checkbox state
        const allCheckboxes = document.querySelectorAll('.product-select');
        const checkedCheckboxes = document.querySelectorAll('.product-select:checked');
        
        document.getElementById('select-all-products').checked = 
          allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
      });
    });
    
    // Export products
    document.getElementById('export-products-btn')?.addEventListener('click', () => {
      this.exportProducts();
    });
    
    // Import products
    document.getElementById('import-products-btn')?.addEventListener('click', () => {
      AdminProductModal.showImportModal();
    });
  },
  
  /**
   * Update selected products count
   */
  updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.product-select:checked').length;
    const countDisplay = document.querySelector('.bulk-action-info span');
    
    if (countDisplay) {
      countDisplay.textContent = `${selectedCount} 件選択中`;
    }
  },
  
  /**
   * Apply bulk action to selected products
   */
  async applyBulkAction() {
    const selectedProducts = Array.from(document.querySelectorAll('.product-select:checked'))
      .map(checkbox => checkbox.dataset.id);
    
    if (selectedProducts.length === 0) {
      alert('操作を適用する商品を選択してください。');
      return;
    }
    
    const action = document.getElementById('bulk-action-select').value;
    
    if (!action) {
      alert('適用する操作を選択してください。');
      return;
    }
    
    // Confirm bulk action
    if (!confirm(`選択した ${selectedProducts.length} 件の商品に対して操作を実行してもよろしいですか？`)) {
      return;
    }
    
    try {
      switch (action) {
        case 'setOnSale':
          await this.bulkUpdateStatus(selectedProducts, '販売中');
          break;
        case 'setStopped':
          await this.bulkUpdateStatus(selectedProducts, '販売停止');
          break;
        case 'setSeasonEnded':
          await this.bulkUpdateStatus(selectedProducts, '今季の販売は終了しました');
          break;
        case 'delete':
          await this.bulkDeleteProducts(selectedProducts);
          break;
        case 'updateStock':
          const stockValue = parseInt(document.getElementById('bulk-stock-value').value);
          if (isNaN(stockValue) || stockValue < 0) {
            alert('有効な在庫数を入力してください。');
            return;
          }
          await this.bulkUpdateStock(selectedProducts, stockValue);
          break;
      }
      
      // Hide bulk actions panel and reload products
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = 'none';
      }
      
      await this.loadProducts();
      
      // Show success message
      alert('一括操作が完了しました。');
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(`一括操作に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Bulk update product status
   * @param {Array} productIds - Product IDs
   * @param {string} status - Status value
   */
  async bulkUpdateStatus(productIds, status) {
    for (const productId of productIds) {
      await API.admin.updateProductStatus(productId, status);
    }
  },
  
  /**
   * Bulk delete products
   * @param {Array} productIds - Product IDs
   */
  async bulkDeleteProducts(productIds) {
    for (const productId of productIds) {
      await API.admin.deleteProduct(productId);
    }
  },
  
  /**
   * Bulk update product stock
   * @param {Array} productIds - Product IDs
   * @param {number} stock - New stock value
   */
  async bulkUpdateStock(productIds, stock) {
    for (const productId of productIds) {
      await API.admin.updateProductStock(productId, stock);
    }
  },
  
  /**
   * Update product status
   * @param {string} productId - Product ID
   * @param {string} status - Status value
   */
  async updateProductStatus(productId, status) {
    try {
      // Update product status
      await API.admin.updateProductStatus(productId, status);
      
      // Reload products
      await this.loadProducts();
    } catch (error) {
      console.error('Update product status error:', error);
      alert(`商品の状態の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Update product stock
   * @param {string} productId - Product ID
   * @param {number} stock - New stock value
   */
  async updateProductStock(productId, stock) {
    try {
      // Update product stock
      await API.admin.updateProductStock(productId, stock);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('在庫数を更新しました。');
    } catch (error) {
      console.error('Update product stock error:', error);
      alert(`在庫数の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Update shipping estimate
   * @param {string} productId - Product ID
   * @param {string} shippingEstimate - Shipping estimate text
   */
  async updateShippingEstimate(productId, shippingEstimate) {
    try {
      // Update shipping estimate
      await API.admin.updateShippingEstimate(productId, shippingEstimate);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('発送までの目安を更新しました。');
    } catch (error) {
      console.error('Update shipping estimate error:', error);
      alert(`発送までの目安の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Create product
   * @param {Object} productData - Product data
   */
  async createProduct(productData) {
    try {
      // Validate product data
      if (!productData.name || !productData.description || isNaN(productData.price) || productData.price < 0) {
        throw new Error('商品名、説明、価格は必須です。');
      }
      
      // Create product
      await API.admin.createProduct(productData);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を追加しました。');
    } catch (error) {
      console.error('Create product error:', error);
      alert(`商品の追加に失敗しました: ${error.message}`);
    }
  },

  /**
   * Update product
   * @param {string} productId - Product ID
   * @param {Object} productData - Product data
   */
  async updateProduct(productId, productData) {
    try {
      // Validate product data
      if (!productData.name || !productData.description || isNaN(productData.price) || productData.price < 0) {
        throw new Error('商品名、説明、価格は必須です。');
      }
      
      // Update product
      await API.admin.updateProduct(productId, productData);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を更新しました。');
    } catch (error) {
      console.error('Update product error:', error);
      alert(`商品の更新に失敗しました: ${error.message}`);
    }
  },

  /**
   * Delete product
   * @param {string} productId - Product ID
   */
  async deleteProduct(productId) {
    try {
      if (!confirm('この商品を削除してもよろしいですか？')) {
        return;
      }
      
      // Delete product
      await API.admin.deleteProduct(productId);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を削除しました。');
    } catch (error) {
      console.error('Delete product error:', error);
      alert(`商品の削除に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Export products to CSV
   */
  exportProducts() {
    try {
      // Get filtered products
      const filters = {
        category: document.getElementById('product-category-filter')?.value || 'all',
        status: document.getElementById('product-status-filter')?.value || 'all',
        stock: document.getElementById('product-stock-filter')?.value || 'all',
        search: document.getElementById('product-search')?.value || ''
      };
      
      const sort = {
        field: document.getElementById('product-sort-field')?.value || 'name',
        order: document.getElementById('product-sort-order')?.value || 'asc'
      };
      
      const products = this.filterAndSortProducts(AdminCore.products, filters, sort);
      
      // Create CSV content
      let csvContent = 'ID,商品名,説明,価格,在庫数,単位,カテゴリ,状態,発送までの目安,在庫アラートしきい値,画像URL\n';
      
      products.forEach(product => {
        const row = [
          product._id,
          `"${product.name.replace(/"/g, '""')}"`,
          `"${product.description.replace(/"/g, '""')}"`,
          product.price,
          product.stock,
          product.unit,
          product.category,
          product.status,
          `"${product.shippingEstimate?.replace(/"/g, '""') || ''}"`,
          product.lowStockThreshold,
          `"${product.images.join(',').replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export products error:', error);
      alert(`商品のエクスポートに失敗しました: ${error.message}`);
    }
  }
};

/**
 * Admin Users Module
 * Handles user management functionality
 */
const AdminUsers = {
  /**
   * Load users
   */
  async loadUsers() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch users
      AdminCore.users = await API.admin.getUsers();
      
      // Render users
      this.renderUsers();
    } catch (error) {
      console.error('Load users error:', error);
      document.getElementById('admin-users').innerHTML = '<p>ユーザーの読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render users
   */
  renderUsers() {
    const usersPanel = document.getElementById('admin-users');
    
    if (!usersPanel) {
      return;
    }
    
    // Create users content
    usersPanel.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>名前</th>
            <th>メールアドレス</th>
            <th>役割</th>
            <th>登録日</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${AdminCore.users.map(user => `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role === 'admin' ? '管理者' : '顧客'}</td>
              <td>${new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
              <td>
                <div class="admin-actions">
                  <button class="btn view-user-btn" data-id="${user._id}">詳細</button>
                  <button class="btn change-role-btn" data-id="${user._id}" data-role="${user.role}">
                    ${user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Add event listeners
    this.setupUsersEventListeners();
  },

  /**
   * Set up users event listeners
   */
  setupUsersEventListeners() {
    // View user buttons
    document.querySelectorAll('.view-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        this.viewUserDetails(userId);
      });
    });
    
    // Change role buttons
    document.querySelectorAll('.change-role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        const currentRole = btn.dataset.role;
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        this.changeUserRole(userId, newRole);
      });
    });
  },

  /**
   * View user details
   * @param {string} userId - User ID
   */
  async viewUserDetails(userId) {
    try {
      // Find user in users array
      const user = AdminCore.users.find(u => u._id === userId);
      
      if (!user) {
        throw new Error('ユーザーが見つかりませんでした。');
      }
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'user-details-modal';
      
      // Format date
      const registrationDate = new Date(user.createdAt);
      const formattedDate = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(registrationDate);
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>ユーザー詳細</h2>
          <div class="user-details">
            <div class="user-details-section">
              <h3>基本情報</h3>
              <div class="user-details-info">
                <div class="user-details-name">名前: ${user.name}</div>
                <div class="user-details-email">メール: ${user.email}</div>
                <div class="user-details-role">役割: ${user.role === 'admin' ? '管理者' : '顧客'}</div>
                <div class="user-details-date">登録日: ${formattedDate}</div>
              </div>
            </div>
            <div class="user-details-section">
              <h3>住所</h3>
              <div class="user-details-addresses">
                ${user.addresses && user.addresses.length > 0 ? user.addresses.map(address => `
                  <div class="user-details-address">
                    <div class="user-details-address-name">${address.name}</div>
                    <div class="user-details-address-phone">${address.phone}</div>
                    <div class="user-details-address-location">${address.postalCode} ${address.city} ${address.address}</div>
                    ${address.isDefault ? '<div class="user-details-address-default">デフォルト</div>' : ''}
                  </div>
                `).join('') : '<p>住所が登録されていません。</p>'}
              </div>
            </div>
            <div class="user-details-actions">
              <button class="btn change-role-btn" data-id="${userId}" data-role="${user.role}">
                ${user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
              </button>
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
      
      modal.querySelector('.change-role-btn').addEventListener('click', () => {
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        this.changeUserRole(userId, newRole);
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
      console.error('View user details error:', error);
      alert('ユーザー詳細の読み込みに失敗しました。');
    }
  },

  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   */
  async changeUserRole(userId, newRole) {
    try {
      // Confirm role change
      if (!confirm(`このユーザーの役割を${newRole === 'admin' ? '管理者' : '顧客'}に変更してもよろしいですか？`)) {
        return;
      }
      
      // Update user role
      await API.admin.updateUserRole(userId, newRole);
      
      // Reload users
      await this.loadUsers();
      
      // Show success message
      alert('ユーザーの役割を更新しました。');
    } catch (error) {
      console.error('Change user role error:', error);
      alert(`ユーザーの役割の更新に失敗しました: ${error.message}`);
    }
  }
};

/**
 * Admin Reports Module
 * Handles reports functionality
 */
const AdminReports = {
  /**
   * Load reports
   */
  async loadReports() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch sales report (last 30 days)
      AdminCore.salesReport = await API.admin.getSalesReport({ period: 'daily' });
      
      // Fetch product report (last 30 days)
      AdminCore.productReport = await API.admin.getProductReport();
      
      // Render reports
      this.renderReports();
    } catch (error) {
      console.error('Load reports error:', error);
      document.getElementById('admin-reports').innerHTML = '<p>レポートの読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render reports
   */
  renderReports() {
    const reportsPanel = document.getElementById('admin-reports');
    
    if (!reportsPanel || !AdminCore.salesReport || !AdminCore.productReport) {
      return;
    }
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(value);
    };
    
    // Create reports content
    reportsPanel.innerHTML = `
      <div class="report-tabs">
        <button class="report-tab-btn active" data-report-tab="sales">売上レポート</button>
        <button class="report-tab-btn" data-report-tab="products">商品レポート</button>
      </div>
      
      <div class="report-tab-content">
        <div id="sales-report" class="report-tab-panel active">
          <div class="report-filters">
            <div class="filter-group">
              <label for="sales-period-filter">期間:</label>
              <select id="sales-period-filter">
                <option value="daily" selected>日次</option>
                <option value="weekly">週次</option>
                <option value="monthly">月次</option>
                <option value="yearly">年次</option>
              </select>
            </div>
            <button class="btn" id="apply-sales-filters">適用</button>
          </div>
          
          <div class="report-summary">
            <div class="summary-card">
              <div class="summary-value">${formatCurrency(AdminCore.salesReport.summary.totalRevenue)}</div>
              <div class="summary-label">総売上</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${AdminCore.salesReport.summary.totalOrders}</div>
              <div class="summary-label">総注文数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${formatCurrency(AdminCore.salesReport.summary.averageOrderValue)}</div>
              <div class="summary-label">平均注文金額</div>
            </div>
          </div>
          
          <div class="report-chart">
            <h3>売上推移</h3>
            <div class="chart-container">
              <!-- Chart would be rendered here in a real application -->
              <table class="report-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>注文数</th>
                    <th>売上</th>
                  </tr>
                </thead>
                <tbody>
                  ${AdminCore.salesReport.salesData.map(data => `
                    <tr>
                      <td>${data.date}</td>
                      <td>${data.orderCount}</td>
                      <td>${formatCurrency(data.revenue)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div id="products-report" class="report-tab-panel">
          <div class="report-summary">
            <h3>商品別売上</h3>
            <table class="report-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>販売数</th>
                  <th>売上</th>
                  <th>注文数</th>
                </tr>
              </thead>
              <tbody>
                ${AdminCore.productReport.productData.map(data => `
                  <tr>
                    <td>${data.name}</td>
                    <td>${AdminCore.getCategoryText(data.category)}</td>
                    <td>${data.totalQuantity}</td>
                    <td>${formatCurrency(data.totalRevenue)}</td>
                    <td>${data.orderCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupReportsEventListeners();
  },

  /**
   * Set up reports event listeners
   */
  setupReportsEventListeners() {
    // Report tab buttons
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.reportTab;
        this.showReportTab(tabName);
      });
    });
    
    // Apply sales filters button
    document.getElementById('apply-sales-filters').addEventListener('click', () => {
      this.applySalesFilters();
    });
  },

  /**
   * Show report tab
   * @param {string} tabName - Tab name
   */
  showReportTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelector(`.report-tab-btn[data-report-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab panel
    document.querySelectorAll('.report-tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-report`).classList.add('active');
  },

  /**
   * Apply sales filters
   */
  async applySalesFilters() {
    try {
      const period = document.getElementById('sales-period-filter').value;
      
      // Fetch sales report
      AdminCore.salesReport = await API.admin.getSalesReport({ period });
      
      // Render reports
      this.renderReports();
    } catch (error) {
      console.error('Apply sales filters error:', error);
      alert('売上レポートフィルターの適用に失敗しました。');
    }
  }
};
