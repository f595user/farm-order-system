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
