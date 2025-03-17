import React from 'react';

const OrderModal = ({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onUpdatePayment, 
  onUpdateShipping,
  getStatusText,
  getPaymentStatusText
}) => {
  if (!order) return null;

  // Format date
  const orderDate = new Date(order.createdAt);
  const formattedDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(orderDate);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>注文詳細</h2>
          <div className="order-details">
            <div className="order-details-header">
              <div className="order-details-id">注文番号: {order._id}</div>
              <div className="order-details-date">注文日時: {formattedDate}</div>
              <div className={`order-details-status status-${order.status}`}>
                {getStatusText(order.status)}
              </div>
            </div>
            
            <div className="order-details-section">
              <h3>顧客情報</h3>
              <div className="order-details-customer">
                <div className="order-details-customer-name">
                  名前: {order.user ? order.user.name : '不明'}
                </div>
                <div className="order-details-customer-email">
                  メール: {order.user ? order.user.email : '不明'}
                </div>
              </div>
            </div>
            
            <div className="order-details-section">
              <h3>注文商品</h3>
              <div className="order-details-items">
                {order.items.map((item, index) => {
                  const product = item.product;
                  if (!product) return null;
                  
                  return (
                    <div className="order-details-item" key={index}>
                      <div className="order-details-item-name">{product.name}</div>
                      <div className="order-details-item-price">
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                      <div className="order-details-item-subtotal">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {order.items.some(item => item.shippingAddress) && (
              <div className="order-details-section">
                <h3>配送先住所</h3>
                <div className="order-details-addresses">
                  {order.items.map((item, index) => {
                    const address = item.shippingAddress;
                    if (!address) return null;
                    
                    return (
                      <div className="order-details-address" key={index}>
                        <div className="order-details-address-product">
                          {item.product.name} ({item.quantity})
                        </div>
                        <div className="order-details-address-name">{address.name}</div>
                        <div className="order-details-address-phone">{address.phone}</div>
                        <div className="order-details-address-location">
                          {address.postalCode} {address.city} {address.address}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="order-details-section">
              <h3>支払い情報</h3>
              <div className="order-details-payment">
                <div className="order-details-payment-method">
                  支払い方法: {order.paymentMethod}
                </div>
                <div className="order-details-payment-status">
                  支払い状況: {getPaymentStatusText(order.paymentStatus)}
                </div>
                {order.paymentDetails && order.paymentDetails.transactionId && (
                  <div className="order-details-payment-transaction">
                    取引ID: {order.paymentDetails.transactionId}
                  </div>
                )}
              </div>
            </div>
            
            <div className="order-details-section">
              <h3>配送情報</h3>
              <div className="order-details-shipping">
                {order.shippingDetails && order.shippingDetails.carrier ? (
                  <>
                    <div className="order-details-shipping-carrier">
                      配送業者: {order.shippingDetails.carrier}
                    </div>
                    {order.shippingDetails.trackingNumber && (
                      <div className="order-details-shipping-tracking">
                        追跡番号: {order.shippingDetails.trackingNumber}
                      </div>
                    )}
                    {order.shippingDetails.estimatedDelivery && (
                      <div className="order-details-shipping-delivery">
                        配送予定日: {new Intl.DateTimeFormat('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }).format(new Date(order.shippingDetails.estimatedDelivery))}
                      </div>
                    )}
                  </>
                ) : (
                  '配送情報はまだありません。'
                )}
              </div>
            </div>
            
            <div className="order-details-section">
              <h3>合計金額</h3>
              <div className="order-details-total">
                <div className="order-details-total-row">
                  <span>小計:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="order-details-total-row">
                  <span>配送料:</span>
                  <span>¥500</span>
                </div>
                <div className="order-details-total-row total">
                  <span>合計:</span>
                  <span>{formatCurrency(order.totalAmount + 500)}</span>
                </div>
              </div>
            </div>
            
            <div className="order-details-actions">
              <button className="btn update-status-btn" onClick={onUpdateStatus}>
                状態更新
              </button>
              <button className="btn update-payment-btn" onClick={onUpdatePayment}>
                支払い状況更新
              </button>
              <button className="btn update-shipping-btn" onClick={onUpdateShipping}>
                配送情報更新
              </button>
              <button className="btn" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
