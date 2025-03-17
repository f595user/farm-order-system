import React from 'react';

const UserModal = ({ user, onClose, onChangeRole }) => {
  if (!user) return null;

  // Format date
  const registrationDate = new Date(user.createdAt);
  const formattedDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(registrationDate);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>ユーザー詳細</h2>
          <div className="user-details">
            <div className="user-details-section">
              <h3>基本情報</h3>
              <div className="user-details-info">
                <div className="user-details-name">名前: {user.name}</div>
                <div className="user-details-email">メール: {user.email}</div>
                <div className="user-details-role">役割: {user.role === 'admin' ? '管理者' : '顧客'}</div>
                <div className="user-details-date">登録日: {formattedDate}</div>
              </div>
            </div>
            
            {user.addresses && user.addresses.length > 0 && (
              <div className="user-details-section">
                <h3>住所</h3>
                <div className="user-details-addresses">
                  {user.addresses.map((address, index) => (
                    <div className="user-details-address" key={index}>
                      <div className="user-details-address-name">{address.name}</div>
                      <div className="user-details-address-phone">{address.phone}</div>
                      <div className="user-details-address-location">
                        {address.postalCode} {address.city} {address.address}
                      </div>
                      {address.isDefault && (
                        <div className="user-details-address-default">デフォルト</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="user-details-actions">
              <button 
                className="btn change-role-btn"
                onClick={() => onChangeRole(user._id, user.role === 'admin' ? 'customer' : 'admin')}
              >
                {user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
              </button>
              <button className="btn" onClick={onClose}>閉じる</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
