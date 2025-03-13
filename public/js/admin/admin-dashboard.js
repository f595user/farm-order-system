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
