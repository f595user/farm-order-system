import React from 'react';

const ConfirmationModal = ({
  show,
  currentStep,
  destinations,
  products,
  totals,
  loading,
  onClose,
  onConfirmationBack,
  onPlaceOrder,
  senderInfo
}) => {
  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span 
          className="close"
          onClick={onClose}
        >
          &times;
        </span>
        
        <h2>注文確認</h2>
        
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">差出人</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">お支払い</div>
          </div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">確認</div>
          </div>
        </div>
        
        <div id="order-confirmation-content">
          <h3>注文内容の確認</h3>
          
          {/* Sender Information */}
          <div className="summary-sender">
            <div className="summary-sender-header">差出人情報</div>
            <div className="summary-sender-details">
              {senderInfo?.name}<br />
              〒{senderInfo?.postalCode} {senderInfo?.city} {senderInfo?.address}<br />
              {senderInfo?.phone}
            </div>
          </div>
          
          {destinations.map(destination => {
            // Check if destination has products
            const destinationHasProducts = Object.values(destination.products).some(quantity => quantity > 0);
            
            if (!destinationHasProducts) {
              return null;
            }
            
            return (
              <div className="summary-destination" key={destination.id}>
                <div className="summary-destination-header">配送先 #{destination.id}</div>
                
                <div className="summary-destination-address">
                  {destination.name}<br />
                  {destination.postalCode} {destination.city} {destination.address}<br />
                  {destination.phone}
                </div>
                
                {Object.entries(destination.products).map(([productId, quantity]) => {
                  if (quantity <= 0) {
                    return null;
                  }
                  
                  const product = products.find(p => p._id === productId);
                  if (!product) {
                    return null;
                  }
                  
                  const productTotal = product.price * quantity;
                  
                  return (
                    <div className="summary-product" key={productId}>
                      <div className="summary-product-name">{product.name} ({product.unit})</div>
                      <div className="summary-product-quantity">x {quantity}個</div>
                      <div className="summary-product-price">
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: 'JPY'
                        }).format(productTotal)}
                      </div>
                    </div>
                  );
                })}
                
                <div className="summary-product">
                  <div className="summary-product-name">配送料</div>
                  <div className="summary-product-price">
                    {new Intl.NumberFormat('ja-JP', {
                      style: 'currency',
                      currency: 'JPY'
                    }).format(totals.shippingCosts && totals.shippingCosts[destination.id] !== undefined 
                      ? totals.shippingCosts[destination.id] 
                      : 500)}
                    <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                      (ID: {destination.id}, 都道府県: {destination.city || '未設定'})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="summary-subtotal summary-item">
            <span>小計:</span>
            <span>
              {new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(totals.subtotal)}
            </span>
          </div>
          
          <div className="summary-total summary-item">
            <span>合計:</span>
            <span>
              {new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(totals.total)}
            </span>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <div className="confirmation-actions-left">
            <button 
              id="back-to-payment-btn" 
              className="btn"
              onClick={onConfirmationBack}
            >
              戻る
            </button>
          </div>
          
          <div className="confirmation-actions-right">
            <button 
              id="edit-order-btn" 
              className="btn"
              onClick={onClose}
            >
              注文を編集する
            </button>
            
            <button 
              id="place-order-btn" 
              className="btn btn-primary"
              onClick={onPlaceOrder}
              disabled={loading}
            >
              {loading ? '処理中...' : '注文を確定する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
