import React, { useState } from 'react';

const UpdateShippingModal = ({ order, onClose, onUpdateShipping }) => {
  const [carrier, setCarrier] = useState(
    order && order.shippingDetails && order.shippingDetails.carrier 
      ? order.shippingDetails.carrier 
      : ''
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order && order.shippingDetails && order.shippingDetails.trackingNumber 
      ? order.shippingDetails.trackingNumber 
      : ''
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order && order.shippingDetails && order.shippingDetails.estimatedDelivery 
      ? new Date(order.shippingDetails.estimatedDelivery).toISOString().split('T')[0]
      : ''
  );

  const handleCarrierChange = (e) => {
    setCarrier(e.target.value);
  };

  const handleTrackingNumberChange = (e) => {
    setTrackingNumber(e.target.value);
  };

  const handleEstimatedDeliveryChange = (e) => {
    setEstimatedDelivery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const shippingDetails = {
      carrier,
      trackingNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
    };
    
    onUpdateShipping(order._id, shippingDetails);
  };

  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>配送情報の更新</h2>
          <div className="update-shipping-form">
            <div className="order-info">
              <div className="order-id">注文番号: {order._id}</div>
              <div className="order-customer">顧客: {order.user ? order.user.name : '不明'}</div>
              <div className="order-date">日時: {new Date(order.createdAt).toLocaleString('ja-JP')}</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="shipping-carrier">配送業者:</label>
                <input 
                  type="text" 
                  id="shipping-carrier"
                  value={carrier}
                  onChange={handleCarrierChange}
                  placeholder="配送業者名を入力"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tracking-number">追跡番号:</label>
                <input 
                  type="text" 
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={handleTrackingNumberChange}
                  placeholder="追跡番号を入力（任意）"
                />
              </div>
              <div className="form-group">
                <label htmlFor="estimated-delivery">配送予定日:</label>
                <input 
                  type="date" 
                  id="estimated-delivery"
                  value={estimatedDelivery}
                  onChange={handleEstimatedDeliveryChange}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={onClose}>キャンセル</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateShippingModal;
