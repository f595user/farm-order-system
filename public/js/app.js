/**
 * Main Application
 * Initializes and coordinates all modules
 */
const App = {
  /**
   * Initialize application
   */
  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize modules
    await Auth.init();
    await ProductsModule.init();
    // CartModule.init(); // Cart functionality has been removed
    await OrdersModule.init();
    
    // Initialize admin module if user is admin and AdminModule is available
    if (Auth.isAdmin() && typeof AdminModule !== 'undefined') {
      await AdminModule.init();
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        this.showTab(tabName);
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  },

  /**
   * Show tab
   * @param {string} tabName - Tab name
   */
  showTab(tabName) {
    console.log('Showing tab:', tabName);
    // Update active tab link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-links a[data-tab="${tabName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    
    // Special handling for admin tab
    if (tabName === 'admin') {
      console.log('Loading admin dashboard');
      
      // Check if AdminModule is available
      if (typeof AdminModule !== 'undefined') {
        try {
          // First try to use AdminCore directly as it's more reliable
          if (typeof AdminCore !== 'undefined' && typeof AdminCore.showAdminTab === 'function') {
            console.log('Using AdminCore.showAdminTab("dashboard")');
            AdminCore.showAdminTab('dashboard');
            return; // Exit early if successful
          }
          
          // If AdminModule.loadDashboard exists, use it as fallback
          if (typeof AdminModule.loadDashboard === 'function') {
            console.log('Calling AdminModule.loadDashboard()');
            AdminModule.loadDashboard();
          } 
          // Otherwise initialize AdminModule if needed
          else if (typeof AdminModule.init === 'function' && !AdminModule._initialized) {
            console.log('Initializing AdminModule from App.showTab');
            AdminModule._initialized = true;
            AdminModule.init().then(() => {
              console.log('AdminModule initialized, showing dashboard');
              // After initialization, try to show dashboard
              if (typeof AdminCore !== 'undefined' && typeof AdminCore.showAdminTab === 'function') {
                AdminCore.showAdminTab('dashboard');
              }
            });
          } else {
            console.error('No valid method found to load admin dashboard');
          }
        } catch (error) {
          console.error('Error loading admin dashboard:', error);
        }
      } else {
        console.error('AdminModule is not defined - check script loading order');
      }
    }
  },

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    alert(message);
  },

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    alert(message);
  }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
