import React from 'react';

const AdminDashboard = ({ 
  dashboardData, 
  onViewOrder, 
  onViewAllOrders, 
  onViewAllProducts, 
  onUpdateStock,
  getStatusText,
  getCategoryText
}) => {
  return (
    <div id="admin-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{dashboardData.orderStats.totalOrders}</div>
          <div className="stat-label">総注文数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData.orderStats.pendingOrders}</div>
          <div className="stat-label">受付中の注文</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData.orderStats.processingOrders}</div>
          <div className="stat-label">準備中の注文</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY'
            }).format(dashboardData.orderStats.totalRevenue)}
          </div>
          <div className="stat-label">総売上</div>
        </div>
      </div>
      
      <div className="admin-section">
        <h3>最近の注文</h3>
        <table className="admin-table">
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
            {dashboardData.recentOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : '不明'}</td>
                <td>{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
                <td>
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(order.totalAmount)}
                </td>
                <td>{getStatusText(order.status)}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn view-order-btn" 
                      onClick={() => onViewOrder(order._id)}
                    >
                      詳細
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          className="btn" 
          id="view-all-orders-btn"
          onClick={onViewAllOrders}
        >
          すべての注文を表示
        </button>
      </div>
      
      <div className="admin-section">
        <h3>在庫切れ間近の商品</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>カテゴリ</th>
              <th>在庫数</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.lowStockProducts.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{getCategoryText(product.category)}</td>
                <td>{product.stock} {product.unit}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn update-stock-btn" 
                      onClick={() => onUpdateStock(product._id)}
                    >
                      在庫更新
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          className="btn" 
          id="view-all-products-btn"
          onClick={onViewAllProducts}
        >
          すべての商品を表示
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
