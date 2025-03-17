import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const SenderModal = ({
  show,
  currentStep,
  onClose,
  onSenderConfirm,
  onSenderBack,
  senderInfo,
  onSenderInfoChange
}) => {
  const { currentUser } = useAuth();
  const [useAccountAddress, setUseAccountAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  useEffect(() => {
    // If user has addresses and one is default, select it initially
    if (currentUser?.addresses?.length > 0) {
      const defaultAddress = currentUser.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    }
  }, [currentUser]);

  if (!show) return null;

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    
    // Find the selected address
    const selectedAddress = currentUser.addresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      // Update sender info with the selected address
      onSenderInfoChange('name', selectedAddress.name || '');
      onSenderInfoChange('phone', selectedAddress.phone || '');
      onSenderInfoChange('postalCode', selectedAddress.postalCode || '');
      onSenderInfoChange('city', selectedAddress.city || '');
      onSenderInfoChange('address', selectedAddress.address || '');
    }
  };

  const toggleUseAccountAddress = () => {
    const newValue = !useAccountAddress;
    setUseAccountAddress(newValue);
    
    // If toggling off, clear the selected address
    if (!newValue) {
      setSelectedAddressId('');
    }
  };

  // 全角→半角変換関数
  const toHalfWidth = (str) => {
    return str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  };

  // 郵便番号の処理
  const handlePostalCodeChange = (e) => {
    let value = e.target.value;
    
    // 全角→半角変換
    value = toHalfWidth(value);
    
    // 数字とハイフン以外を除去
    value = value.replace(/[^0-9-]/g, '');
    
    // 3桁後にハイフンがない場合は自動挿入
    if (value.length > 3 && !value.includes('-')) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    // 最大8文字 (例: 123-4567) で制限
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    onSenderInfoChange('postalCode', value);
  };

  // 電話番号の処理
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // 全角→半角変換
    value = toHalfWidth(value);
    
    // 数字以外を除去
    value = value.replace(/[^0-9]/g, '');
    
    // 最大11桁で制限
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    onSenderInfoChange('phone', value);
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span 
          className="close"
          onClick={onClose}
        >
          &times;
        </span>
        
        <h2>差出人情報</h2>
        
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">差出人</div>
          </div>
          <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">お支払い</div>
          </div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">確認</div>
          </div>
        </div>
        
        <div id="sender-selection-content">
          {currentUser?.addresses?.length > 0 && (
            <div className="use-account-address">
              <label>
                <input 
                  type="checkbox" 
                  checked={useAccountAddress}
                  onChange={toggleUseAccountAddress}
                />
                アカウントに登録されている住所を使用する
              </label>
              
              {useAccountAddress && (
                <div className="saved-addresses">
                  {currentUser.addresses.map(address => (
                    <div 
                      key={address._id}
                      className={`saved-address ${selectedAddressId === address._id ? 'selected' : ''}`}
                      onClick={() => handleAddressSelect(address._id)}
                    >
                      <div className="address-radio">
                        <input 
                          type="radio" 
                          name="saved-address" 
                          id={`address-${address._id}`}
                          checked={selectedAddressId === address._id}
                          onChange={() => handleAddressSelect(address._id)}
                        />
                        <label htmlFor={`address-${address._id}`}></label>
                      </div>
                      <div className="address-details">
                        <div className="address-name">
                          {address.name}
                        </div>
                        <div className="address-info">
                          〒{address.postalCode} {address.city} {address.address}<br />
                          {address.phone}
                        </div>
                      </div>
                      {address.isDefault && <span className="default-badge">デフォルト</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {(!useAccountAddress || currentUser?.addresses?.length === 0) && (
            <div className="sender-form">
              <h3>差出人情報を入力</h3>
              <div className="form-group">
                <label htmlFor="sender-name">お名前</label>
                <div className="name-input-container">
                  <input 
                    type="text" 
                    id="sender-name" 
                    value={senderInfo.name}
                    onChange={(e) => onSenderInfoChange('name', e.target.value)}
                    required 
                  />
                  <span className="name-suffix">様</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="sender-postal">郵便番号</label>
                <input 
                  type="text" 
                  id="sender-postal" 
                  value={senderInfo.postalCode}
                  onChange={handlePostalCodeChange}
                  placeholder="例: 123-4567"
                  maxLength="8"
                  required 
                />
              </div>
              
              <div className="address-line">
                <div className="form-group prefecture-group">
                  <label htmlFor="sender-city">都道府県</label>
                  <input 
                    type="text" 
                    id="sender-city" 
                    value={senderInfo.city}
                    onChange={(e) => onSenderInfoChange('city', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group address-group">
                  <label htmlFor="sender-address">住所</label>
                  <input 
                    type="text" 
                    id="sender-address" 
                    value={senderInfo.address}
                    onChange={(e) => onSenderInfoChange('address', e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="sender-phone">電話番号</label>
                <input 
                  type="tel" 
                  id="sender-phone" 
                  value={senderInfo.phone}
                  onChange={handlePhoneChange}
                  placeholder="例: 09012345678"
                  maxLength="11"
                  required 
                />
              </div>
            </div>
          )}
          
          <div className="checkout-actions">
            <button 
              className="btn" 
              id="sender-back-btn"
              onClick={onSenderBack}
            >
              戻る
            </button>
            <button 
              className="btn btn-primary" 
              id="sender-next-btn"
              onClick={onSenderConfirm}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenderModal;
