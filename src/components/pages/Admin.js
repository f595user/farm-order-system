import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Admin = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on active tab
        if (activeTab === 'dashboard') {
          const response = await fetch('/api/admin/dashboard', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          
          const data = await response.json();
          setDashboardData(data);
        } else if (activeTab === 'orders') {
          const response = await fetch('/api/admin/orders', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          
          const data = await response.json();
          setOrders(data);
        } else if (activeTab === 'products') {
          const response = await fetch('/api/products', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          
          const data = await response.json();
          setProducts(data);
        } else if (activeTab === 'users') {
          const response = await fetch('/api/admin/users', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Redirect if not admin
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  return (
    <section className="admin-section">
      <h2>管理者ダッシュボード</h2>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')}
        >
          ダッシュボード
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          注文管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
          onClick={() => setActiveTab('products')}
        >
          商品管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
        >
          ユーザー管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reports')}
        >
          レポート
        </button>
      </div>
      
      <div className="admin-tab-content">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>エラーが発生しました: {error}</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
              <div id="admin-dashboard" className="admin-tab-panel">
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>注文</h3>
                    <p className="stat-number">{dashboardData.orderStats.totalOrders}</p>
                    <div className="stat-details">
                      <p>保留中: {dashboardData.orderStats.pendingOrders}</p>
                      <p>処理中: {dashboardData.orderStats.processingOrders}</p>
                      <p>発送済み: {dashboardData.orderStats.shippedOrders}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>商品</h3>
                    <p className="stat-number">{dashboardData.productStats.totalProducts}</p>
                    <div className="stat-details">
                      <p>在庫切れ: {dashboardData.productStats.outOfStockProducts}</p>
                      <p>在庫少: {dashboardData.productStats.lowStockCount}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>ユーザー</h3>
                    <p className="stat-number">{dashboardData.userStats.totalUsers}</p>
                    <div className="stat-details">
                      <p>管理者: {dashboardData.userStats.totalAdmins}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>売上</h3>
                    <p className="stat-number">¥{dashboardData.orderStats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="dashboard-recent">
                  <h3>最近の注文</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>注文ID</th>
                        <th>ユーザー</th>
                        <th>金額</th>
                        <th>状態</th>
                        <th>日付</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.map(order => (
                        <tr key={order._id}>
                          <td>{order._id}</td>
                          <td>{order.user ? order.user.name : '不明'}</td>
                          <td>¥{order.totalAmount.toLocaleString()}</td>
                          <td>{order.status}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="dashboard-alerts">
                  <h3>在庫アラート</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>商品名</th>
                        <th>現在の在庫</th>
                        <th>在庫しきい値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.lowStockProducts.map(product => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>{product.stock}</td>
                          <td>{product.lowStockThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div id="admin-orders" className="admin-tab-panel">
                <div className="orders-filters">
                  {/* Filters would go here */}
                </div>
                
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>注文ID</th>
                      <th>ユーザー</th>
                      <th>金額</th>
                      <th>状態</th>
                      <th>支払い状態</th>
                      <th>日付</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user ? order.user.name : '不明'}</td>
                        <td>¥{order.totalAmount.toLocaleString()}</td>
                        <td>{order.status}</td>
                        <td>{order.paymentStatus}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-small">詳細</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div id="admin-products" className="admin-tab-panel">
                <div className="products-actions">
                  <button className="btn btn-primary">新規商品</button>
                </div>
                
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>商品ID</th>
                      <th>商品名</th>
                      <th>カテゴリー</th>
                      <th>価格</th>
                      <th>在庫</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>{product._id}</td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>¥{product.price.toLocaleString()}</td>
                        <td>{product.stock}</td>
                        <td>
                          <button className="btn btn-small">編集</button>
                          <button className="btn btn-small btn-danger">削除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div id="admin-users" className="admin-tab-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ユーザーID</th>
                      <th>名前</th>
                      <th>メール</th>
                      <th>役割</th>
                      <th>登録日</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-small">詳細</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div id="admin-reports" className="admin-tab-panel">
                <div className="reports-options">
                  <button className="btn">売上レポート</button>
                  <button className="btn">商品パフォーマンス</button>
                </div>
                
                <div className="report-container">
                  <p>レポートタイプを選択してください</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Admin;
