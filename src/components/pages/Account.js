import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const Account = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
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
    }
  }, [currentUser]);

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
          <h3>配送先住所</h3>
          
          {addresses.length === 0 ? (
            <p>配送先住所が登録されていません。</p>
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
                    <div>{address.phone}</div>
                    <div>{address.postalCode}</div>
                    <div>{address.city} {address.address}</div>
                  </div>
                  <div className="address-actions">
                    <button 
                      className="btn edit-address-btn" 
                      onClick={() => handleEditAddress(address)}
                    >
                      編集
                    </button>
                    <button 
                      className="btn delete-address-btn" 
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      削除
                    </button>
                    {!address.isDefault && (
                      <button 
                        className="btn btn-primary set-default-btn" 
                        onClick={() => handleSetDefaultAddress(address._id)}
                      >
                        デフォルトに設定
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="btn" 
            id="add-address-btn"
            onClick={handleAddAddress}
          >
            新しい住所を追加
          </button>
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
            <h2>{addressFormMode === 'add' ? '新しい配送先住所を追加' : '配送先住所を編集'}</h2>
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
                  デフォルトの配送先として設定
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

export default Account;
