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
