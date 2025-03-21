import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ 
  destinations, 
  products, 
  totals, 
  loading, 
  onConfirmOrder 
}) => {
  const navigate = useNavigate();

  return (
    <div className="order-summary">
      <h3>注文内容</h3>
      <div id="order-summary-container">
        {!totals.hasProducts ? (
          <p>商品が選択されていません。</p>
        ) : (
          <>
            <div className="summary-item">
              <span>商品点数:</span>
              <span>{totals.totalItems}点</span>
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
                  
                  {destination.name && destination.address ? (
                    <div className="summary-destination-address">
                      {destination.name}<br />
                      {destination.postalCode} {destination.city} {destination.address}<br />
                      {destination.phone}
                    </div>
                  ) : (
                    <div className="summary-destination-address">住所が入力されていません</div>
                  )}
                  
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
                        <div className="summary-product-name">{product.name}</div>
                        <div className="summary-product-quantity">{product.unit} x {quantity}</div>
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
                      {/* <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                        (ID: {destination.id}, 都道府県: {destination.city || '未設定'})
                      </span> */}
                    </div>
                    {/* <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                      デバッグ: shippingCosts={JSON.stringify(totals.shippingCosts || {})}
                    </div> */}
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
          </>
        )}
      </div>
      
      <div className="order-actions">
        <button 
          id="back-to-products-btn" 
          className="btn"
          onClick={() => navigate('/products')}
        >
          商品一覧に戻る
        </button>
        
        <button 
          id="confirm-order-btn" 
          className="btn btn-primary"
          onClick={onConfirmOrder}
          disabled={!totals.hasProducts || loading}
        >
          {loading ? '処理中...' : '注文を確定する'}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
