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
