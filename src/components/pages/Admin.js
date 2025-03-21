import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

// Admin Dashboard Components
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AdminAnnouncements from './admin/AdminAnnouncements';

// Modals
import OrderModal from './admin/modals/OrderModal';
import ProductModal from './admin/modals/ProductModal';
import UserModal from './admin/modals/UserModal';
import UpdateStockModal from './admin/modals/UpdateStockModal';
import UpdateStatusModal from './admin/modals/UpdateStatusModal';
import UpdatePaymentModal from './admin/modals/UpdatePaymentModal';
import UpdateShippingModal from './admin/modals/UpdateShippingModal';
import ShippingEstimateModal from './admin/modals/ShippingEstimateModal';
import AnnouncementModal from './admin/modals/AnnouncementModal';

const Admin = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);
  const [showUpdateShippingModal, setShowUpdateShippingModal] = useState(false);
  const [showShippingEstimateModal, setShowShippingEstimateModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  
  // Filter states
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    paymentStatus: '',
    search: ''
  });
  
  const [productFilters, setProductFilters] = useState({
    category: 'all',
    status: 'all',
    stock: 'all',
    search: ''
  });
  
  const [productSort, setProductSort] = useState({
    field: 'name',
    order: 'asc'
  });
  
  const [reportPeriod, setReportPeriod] = useState('daily');
  
  // Helper functions
  const getStatusText = (status) => {
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
  };
  
  const getPaymentStatusText = (paymentStatus) => {
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
  };
  
  const getCategoryText = (category) => {
    switch (category) {
      case 'アスパラ':
        return 'アスパラ';
      case 'はちみつ':
        return 'はちみつ';
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on active tab
        if (activeTab === 'dashboard') {
          const data = await API.admin.getDashboard();
          setDashboardData(data);
        } else if (activeTab === 'orders') {
          const data = await API.admin.getOrders(orderFilters);
          setOrders(data);
        } else if (activeTab === 'products') {
          const data = await API.products.getAll();
          setProducts(data);
        } else if (activeTab === 'users') {
          const data = await API.admin.getUsers();
          setUsers(data);
        } else if (activeTab === 'reports') {
          const salesData = await API.admin.getSalesReport({ period: reportPeriod });
          const productData = await API.admin.getProductReport();
          setSalesReport(salesData);
          setProductReport(productData);
        } else if (activeTab === 'announcements') {
          const data = await API.announcements.getAll();
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, orderFilters, reportPeriod]);

  // Event handlers
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };
  
  const handleViewOrderDetails = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    setSelectedItem(order);
    setShowOrderModal(true);
  };
  
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await API.admin.updateOrderStatus(orderId, status);
      // Refresh orders data
      const data = await API.admin.getOrders(orderFilters);
      setOrders(data);
      setShowUpdateStatusModal(false);
    } catch (error) {
      console.error('Update order status error:', error);
      alert(`注文状態の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleUpdatePaymentStatus = async (orderId, paymentStatus, transactionId) => {
    try {
      await API.admin.updatePaymentStatus(orderId, paymentStatus, transactionId);
      // Refresh orders data
      const data = await API.admin.getOrders(orderFilters);
      setOrders(data);
      setShowUpdatePaymentModal(false);
    } catch (error) {
      console.error('Update payment status error:', error);
      alert(`支払い状況の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleUpdateShippingDetails = async (orderId, shippingDetails) => {
    try {
      await API.admin.updateShippingDetails(orderId, shippingDetails);
      // Refresh orders data
      const data = await API.admin.getOrders(orderFilters);
      setOrders(data);
      setShowUpdateShippingModal(false);
    } catch (error) {
      console.error('Update shipping details error:', error);
      alert(`配送情報の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleAddProduct = () => {
    setSelectedItem(null);
    setShowProductModal(true);
  };
  
  const handleEditProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedItem(product);
    setShowProductModal(true);
  };
  
  const handleUpdateStock = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedItem(product);
    setShowUpdateStockModal(true);
  };
  
  const handleUpdateProductStock = async (productId, stock) => {
    try {
      await API.admin.updateProductStock(productId, stock);
      // Refresh products data
      const data = await API.products.getAll();
      setProducts(data);
      setShowUpdateStockModal(false);
    } catch (error) {
      console.error('Update product stock error:', error);
      alert(`在庫数の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleUpdateShippingEstimate = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedItem(product);
    setShowShippingEstimateModal(true);
  };
  
  const handleUpdateProductShippingEstimate = async (productId, shippingEstimate) => {
    try {
      await API.admin.updateShippingEstimate(productId, shippingEstimate);
      // Refresh products data
      const data = await API.products.getAll();
      setProducts(data);
      setShowShippingEstimateModal(false);
    } catch (error) {
      console.error('Update shipping estimate error:', error);
      alert(`発送までの目安の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    try {
      if (!window.confirm('この商品を削除してもよろしいですか？')) {
        return;
      }
      
      await API.admin.deleteProduct(productId);
      // Refresh products data
      const data = await API.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Delete product error:', error);
      alert(`商品の削除に失敗しました: ${error.message}`);
    }
  };
  
  const handleSaveProduct = async (productData) => {
    try {
      if (selectedItem) {
        // Update existing product
        await API.admin.updateProduct(selectedItem._id, productData);
      } else {
        // Create new product
        await API.admin.createProduct(productData);
      }
      
      // Refresh products data
      const data = await API.products.getAll();
      setProducts(data);
      setShowProductModal(false);
    } catch (error) {
      console.error('Save product error:', error);
      alert(`商品の保存に失敗しました: ${error.message}`);
    }
  };
  
  const handleViewUserDetails = (userId) => {
    const user = users.find(u => u._id === userId);
    setSelectedItem(user);
    setShowUserModal(true);
  };
  
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      if (!window.confirm(`このユーザーの役割を${newRole === 'admin' ? '管理者' : '顧客'}に変更してもよろしいですか？`)) {
        return;
      }
      
      await API.admin.updateUserRole(userId, newRole);
      // Refresh users data
      const data = await API.admin.getUsers();
      setUsers(data);
      setShowUserModal(false);
    } catch (error) {
      console.error('Change user role error:', error);
      alert(`ユーザーの役割の更新に失敗しました: ${error.message}`);
    }
  };
  
  const handleApplyOrderFilters = (filters) => {
    setOrderFilters(filters);
  };
  
  const handleApplyProductFilters = (filters, sort) => {
    setProductFilters(filters);
    setProductSort(sort);
  };
  
  const handleChangeSalesReportPeriod = (period) => {
    setReportPeriod(period);
  };
  
  const handleSaveAnnouncement = async (announcementData) => {
    try {
      if (selectedItem) {
        // Update existing announcement
        await API.announcements.update(selectedItem._id, announcementData);
      } else {
        // Create new announcement
        await API.announcements.create(announcementData);
      }
      
      // Refresh announcements data
      const data = await API.announcements.getAll();
      setAnnouncements(data);
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error('Save announcement error:', error);
      alert(`お知らせの保存に失敗しました: ${error.message}`);
    }
  };
  
  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await API.announcements.delete(announcementId);
      
      // Refresh announcements data
      const data = await API.announcements.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error('Delete announcement error:', error);
      alert(`お知らせの削除に失敗しました: ${error.message}`);
    }
  };

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
          onClick={() => handleTabChange('dashboard')}
        >
          ダッシュボード
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => handleTabChange('orders')}
        >
          注文管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
          onClick={() => handleTabChange('products')}
        >
          商品管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => handleTabChange('users')}
        >
          ユーザー管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`} 
          onClick={() => handleTabChange('announcements')}
        >
          投稿管理
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`} 
          onClick={() => handleTabChange('reports')}
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
            {/* All tabs are rendered but only the active one is visible */}
            <div className={`admin-tab-panel ${activeTab === 'dashboard' ? 'active' : ''}`}>
              {dashboardData && (
                <AdminDashboard 
                  dashboardData={dashboardData} 
                  onViewOrder={handleViewOrderDetails}
                  onViewAllOrders={() => handleTabChange('orders')}
                  onViewAllProducts={() => handleTabChange('products')}
                  onUpdateStock={handleUpdateStock}
                  getStatusText={getStatusText}
                  getCategoryText={getCategoryText}
                />
              )}
            </div>
            
            <div className={`admin-tab-panel ${activeTab === 'orders' ? 'active' : ''}`}>
              <AdminOrders 
                orders={orders}
                filters={orderFilters}
                onApplyFilters={handleApplyOrderFilters}
                onViewOrderDetails={handleViewOrderDetails}
                onUpdateStatus={(orderId) => {
                  setSelectedItem(orders.find(o => o._id === orderId));
                  setShowUpdateStatusModal(true);
                }}
                getStatusText={getStatusText}
                getPaymentStatusText={getPaymentStatusText}
              />
            </div>
            
            <div className={`admin-tab-panel ${activeTab === 'products' ? 'active' : ''}`}>
              <AdminProducts 
                products={products}
                filters={productFilters}
                sort={productSort}
                onApplyFilters={handleApplyProductFilters}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onUpdateStock={handleUpdateStock}
                onUpdateShippingEstimate={handleUpdateShippingEstimate}
                onDeleteProduct={handleDeleteProduct}
                getCategoryText={getCategoryText}
              />
            </div>
            
            <div className={`admin-tab-panel ${activeTab === 'users' ? 'active' : ''}`}>
              <AdminUsers 
                users={users}
                onViewUserDetails={handleViewUserDetails}
                onChangeUserRole={handleChangeUserRole}
              />
            </div>
            
            <div className={`admin-tab-panel ${activeTab === 'announcements' ? 'active' : ''}`}>
              <AdminAnnouncements 
                announcements={announcements}
                onAddAnnouncement={() => {
                  setSelectedItem(null);
                  setShowAnnouncementModal(true);
                }}
                onEditAnnouncement={(announcementId) => {
                  const announcement = announcements.find(a => a._id === announcementId);
                  setSelectedItem(announcement);
                  setShowAnnouncementModal(true);
                }}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            </div>
            
            <div className={`admin-tab-panel ${activeTab === 'reports' ? 'active' : ''}`}>
              {salesReport && productReport && (
                <AdminReports 
                  salesReport={salesReport}
                  productReport={productReport}
                  period={reportPeriod}
                  onChangePeriod={handleChangeSalesReportPeriod}
                  getCategoryText={getCategoryText}
                />
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      {showOrderModal && (
        <OrderModal 
          order={selectedItem}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={() => {
            setShowOrderModal(false);
            setShowUpdateStatusModal(true);
          }}
          onUpdatePayment={() => {
            setShowOrderModal(false);
            setShowUpdatePaymentModal(true);
          }}
          onUpdateShipping={() => {
            setShowOrderModal(false);
            setShowUpdateShippingModal(true);
          }}
          getStatusText={getStatusText}
          getPaymentStatusText={getPaymentStatusText}
        />
      )}
      
      {showProductModal && (
        <ProductModal 
          product={selectedItem}
          onClose={() => setShowProductModal(false)}
          onSave={handleSaveProduct}
        />
      )}
      
      {showUserModal && (
        <UserModal 
          user={selectedItem}
          onClose={() => setShowUserModal(false)}
          onChangeRole={handleChangeUserRole}
        />
      )}
      
      {showUpdateStockModal && (
        <UpdateStockModal 
          product={selectedItem}
          onClose={() => setShowUpdateStockModal(false)}
          onUpdateStock={handleUpdateProductStock}
        />
      )}
      
      {showUpdateStatusModal && (
        <UpdateStatusModal 
          order={selectedItem}
          onClose={() => setShowUpdateStatusModal(false)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
      
      {showUpdatePaymentModal && (
        <UpdatePaymentModal 
          order={selectedItem}
          onClose={() => setShowUpdatePaymentModal(false)}
          onUpdatePayment={handleUpdatePaymentStatus}
        />
      )}
      
      {showUpdateShippingModal && (
        <UpdateShippingModal 
          order={selectedItem}
          onClose={() => setShowUpdateShippingModal(false)}
          onUpdateShipping={handleUpdateShippingDetails}
        />
      )}
      
      {showShippingEstimateModal && (
        <ShippingEstimateModal
          product={selectedItem}
          onClose={() => setShowShippingEstimateModal(false)}
          onUpdateShippingEstimate={handleUpdateProductShippingEstimate}
        />
      )}
      
      {showAnnouncementModal && (
        <AnnouncementModal
          announcement={selectedItem}
          onClose={() => setShowAnnouncementModal(false)}
          onSave={handleSaveAnnouncement}
        />
      )}
    </section>
  );
};

export default Admin;
