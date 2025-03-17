import React, { useState } from 'react';

const AdminReports = ({ 
  salesReport, 
  productReport, 
  period, 
  onChangePeriod,
  getCategoryText
}) => {
  const [activeReportTab, setActiveReportTab] = useState('sales');

  const handleReportTabChange = (tabName) => {
    setActiveReportTab(tabName);
  };

  const handlePeriodChange = (e) => {
    onChangePeriod(e.target.value);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value);
  };

  return (
    <div id="admin-reports">
      <div className="report-tabs">
        <button 
          className={`report-tab-btn ${activeReportTab === 'sales' ? 'active' : ''}`} 
          onClick={() => handleReportTabChange('sales')}
        >
          売上レポート
        </button>
        <button 
          className={`report-tab-btn ${activeReportTab === 'products' ? 'active' : ''}`} 
          onClick={() => handleReportTabChange('products')}
        >
          商品レポート
        </button>
      </div>
      
      <div className="report-tab-content">
        {/* Sales Report Tab */}
        <div 
          id="sales-report" 
          className={`report-tab-panel ${activeReportTab === 'sales' ? 'active' : ''}`}
        >
          <div className="report-filters">
            <div className="filter-group">
              <label htmlFor="sales-period-filter">期間:</label>
              <select 
                id="sales-period-filter"
                value={period}
                onChange={handlePeriodChange}
              >
                <option value="daily">日次</option>
                <option value="weekly">週次</option>
                <option value="monthly">月次</option>
                <option value="yearly">年次</option>
              </select>
            </div>
          </div>
          
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(salesReport.summary.totalRevenue)}</div>
              <div className="summary-label">総売上</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{salesReport.summary.totalOrders}</div>
              <div className="summary-label">総注文数</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(salesReport.summary.averageOrderValue)}</div>
              <div className="summary-label">平均注文金額</div>
            </div>
          </div>
          
          <div className="report-chart">
            <h3>売上推移</h3>
            <div className="chart-container">
              {/* Chart would be rendered here in a real application */}
              <table className="report-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>注文数</th>
                    <th>売上</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.salesData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.date}</td>
                      <td>{data.orderCount}</td>
                      <td>{formatCurrency(data.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Products Report Tab */}
        <div 
          id="products-report" 
          className={`report-tab-panel ${activeReportTab === 'products' ? 'active' : ''}`}
        >
          <div className="report-summary">
            <h3>商品別売上</h3>
            <table className="report-table">
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
                {productReport.productData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.name}</td>
                    <td>{getCategoryText(data.category)}</td>
                    <td>{data.totalQuantity}</td>
                    <td>{formatCurrency(data.totalRevenue)}</td>
                    <td>{data.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
