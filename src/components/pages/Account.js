import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const Account = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormMode, setAddressFormMode] = useState('add');
  const [currentAddressId, setCurrentAddressId] = useState('');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressPostal, setAddressPostal] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAddresses(currentUser.addresses || []);
      
      // Fetch order history
      fetchOrders();
    }
  }, [currentUser]);
  
  const fetchOrders = async () => {
    if (!isAuthenticated() || !currentUser) return;
    
    try {
      setOrdersLoading(true);
      const orderData = await API.orders.getAll();
      
      // Filter orders to ensure only the current user's orders are displayed
      // This is a safeguard in case the API returns orders from other users
      const filteredOrders = orderData.filter(order => 
        order.user && (
          // If order.user is an object with _id property (populated)
          (order.user._id && order.user._id.toString() === currentUser.id) ||
          // If order.user is just the ID (not populated)
          (typeof order.user === 'string' && order.user === currentUser.id)
        )
      );
      
      setOrders(filteredOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('注文履歴の取得に失敗しました。');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('名前とメールアドレスを入力してください。');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await API.user.updateProfile(currentUser.id, { name, email });
      
      setSuccessMessage('プロフィールを更新しました。');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'プロフィールの更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setAddressFormMode('add');
    setCurrentAddressId('');
    setAddressName('');
    setAddressPhone('');
    setAddressPostal('');
    setAddressCity('');
    setAddressStreet('');
    setAddressIsDefault(false);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setAddressFormMode('edit');
    setCurrentAddressId(address._id);
    setAddressName(address.name || '');
    setAddressPhone(address.phone || '');
    setAddressPostal(address.postalCode || '');
    setAddressCity(address.city || '');
    setAddressStreet(address.address || '');
    setAddressIsDefault(address.isDefault || false);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('この住所を削除してもよろしいですか？')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.user.deleteAddress(currentUser.id, addressId);
      
      setAddresses(response.addresses || []);
      setSuccessMessage('住所を削除しました。');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || '住所の削除に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      setError(null);
      
      const address = addresses.find(addr => addr._id === addressId);
      
      if (!address) return;
      
      const response = await API.user.updateAddress(currentUser.id, addressId, {
        ...address,
        isDefault: true
      });
      
      setAddresses(response.addresses || []);
      setSuccessMessage('デフォルトの住所を設定しました。');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'デフォルト住所の設定に失敗しました。');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('この注文をキャンセルしてもよろしいですか？')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await API.orders.cancel(orderId);
      
      // Refresh orders after cancellation
      fetchOrders();
      
      setSuccessMessage('注文をキャンセルしました。');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || '注文のキャンセルに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    if (!addressName || !addressPhone || !addressPostal || !addressCity || !addressStreet) {
      setError('すべての項目を入力してください。');
      return;
    }
    
    const addressData = {
      name: addressName,
      phone: addressPhone,
      postalCode: addressPostal,
      city: addressCity,
      address: addressStreet,
      isDefault: addressIsDefault
    };
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (addressFormMode === 'add') {
        response = await API.user.addAddress(currentUser.id, addressData);
      } else {
        response = await API.user.updateAddress(currentUser.id, currentAddressId, addressData);
      }
      
      setAddresses(response.addresses || []);
      setShowAddressForm(false);
      setSuccessMessage(addressFormMode === 'add' ? '住所を追加しました。' : '住所を更新しました。');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || `住所の${addressFormMode === 'add' ? '追加' : '更新'}に失敗しました。`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <section id="account">
        <h2>アカウント情報</h2>
        <div className="auth-required-message">
          <p>アカウント情報を表示するにはログインしてください。</p>
        </div>
      </section>
    );
  }

  return (
    <section id="account">
      <h2>アカウント情報</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      
      <div className="account-details">
        <div className="profile-section">
          <h3>プロフィール</h3>
          <form id="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name">名前</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </form>
        </div>
        
        <div className="addresses-section">
          <div className="section-header">
            <h3>差出人住所</h3>
          </div>
          
          {addresses.length === 0 ? (
            <div className="empty-state">
              <p>差出人住所が登録されていません。</p>
              <p>「新しい住所を追加」ボタンをクリックして、差出人住所を登録してください。</p>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map(address => (
                <div 
                  className={`address-card${address.isDefault ? ' default' : ''}`}
                  key={address._id}
                >
                  {address.isDefault && <span className="default-badge">デフォルト</span>}
                  <div className="address-name">{address.name}</div>
                  <div className="address-details">
                    <div><i className="fas fa-phone"></i> {address.phone}</div>
                    <div><i className="fas fa-map-marker-alt"></i> 〒{address.postalCode}</div>
                    <div>{address.city} {address.address}</div>
                  </div>
                  <div className="address-actions">
                    <button 
                      className="btn edit-address-btn" 
                      onClick={() => handleEditAddress(address)}
                      title="編集"
                    >
                      <i className="fas fa-edit"></i> 編集
                    </button>
                    {!address.isDefault && (
                      <button 
                        className="btn btn-primary set-default-btn" 
                        onClick={() => handleSetDefaultAddress(address._id)}
                        title="デフォルトに設定"
                      >
                        <i className="fas fa-check-circle"></i> デフォルトに設定
                      </button>
                    )}
                    <button 
                      className="btn delete-address-btn" 
                      onClick={() => handleDeleteAddress(address._id)}
                      title="削除"
                    >
                      <i className="fas fa-trash-alt"></i> 削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="add-address-container">
            <button 
              className="btn btn-primary" 
              id="add-address-btn"
              onClick={handleAddAddress}
            >
              <i className="fas fa-plus"></i> 新しい住所を追加
            </button>
          </div>
        </div>
        
        {/* Order History Section */}
        <div className="orders-section">
          <h3>注文履歴</h3>
          
          {ordersLoading ? (
            <p>注文履歴を読み込み中...</p>
          ) : orders.length === 0 ? (
            <p>注文履歴がありません。</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <div className="order-id">注文番号: {order._id.substring(order._id.length - 8)}</div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className={`order-status status-${order.status}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div className="order-item" key={index}>
                        <div className="item-name">
                          {item.product ? item.product.name : '商品情報なし'}
                        </div>
                        <div className="item-quantity">
                          {item.quantity}点
                        </div>
                        <div className="item-price">
                          {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: 'JPY'
                          }).format(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-total">
                      <span>合計:</span>
                      <span>
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: 'JPY'
                        }).format(order.totalAmount)}
                      </span>
                    </div>
                    
                    <div className="order-payment">
                      <span>支払い方法:</span>
                      <span>{getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                    
                    <div className="order-payment-status">
                      <span>支払い状況:</span>
                      <span className={`payment-status-${order.paymentStatus}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                    
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button 
                        className="btn cancel-order-btn"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={order.status === 'shipped' || order.status === 'delivered'}
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showAddressForm && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span 
              className="close" 
              onClick={() => setShowAddressForm(false)}
            >
              &times;
            </span>
            <h2>{addressFormMode === 'add' ? '新しい差出人住所を追加' : '差出人住所を編集'}</h2>
            <form id="address-form" onSubmit={handleAddressSubmit}>
              <div className="form-group">
                <label htmlFor="address-name">名前</label>
                <input 
                  type="text" 
                  id="address-name" 
                  name="name" 
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="address-phone">電話番号</label>
                <input 
                  type="tel" 
                  id="address-phone" 
                  name="phone" 
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="address-postal">郵便番号</label>
                <input 
                  type="text" 
                  id="address-postal" 
                  name="postalCode" 
                  value={addressPostal}
                  onChange={(e) => setAddressPostal(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="address-city">市区町村</label>
                <input 
                  type="text" 
                  id="address-city" 
                  name="city" 
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="address-street">住所</label>
                <input 
                  type="text" 
                  id="address-street" 
                  name="address" 
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    id="address-default" 
                    name="isDefault"
                    checked={addressIsDefault}
                    onChange={(e) => setAddressIsDefault(e.target.checked)}
                  />
                  デフォルトの差出人として設定
                </label>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// Helper functions for text display
const getStatusText = (status) => {
  const statusMap = {
    'pending': '処理待ち',
    'processing': '処理中',
    'shipped': '発送済み',
    'delivered': '配達済み',
    'cancelled': 'キャンセル'
  };
  return statusMap[status] || status;
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    'credit_card': 'クレジットカード',
    'bank_transfer': '銀行振込',
    'cash_on_delivery': '代金引換'
  };
  return methodMap[method] || method;
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    'pending': '未払い',
    'paid': '支払い済み',
    'failed': '失敗',
    'refunded': '返金済み'
  };
  return statusMap[status] || status;
};

export default Account;
