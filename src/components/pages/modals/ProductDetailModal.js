import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetailModal = ({ product, onClose }) => {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  // Format price with Japanese Yen
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(product.price);
  
  // Stock status - only show out of stock message, not the quantity
  const stockStatus = product.stock > 0
    ? ''
    : <span style={{ color: 'red' }}>在庫切れ</span>;
  
  // Status display
  let statusDisplay = null;
  if (product.status !== '販売中') {
    statusDisplay = <div className="product-detail-status">{product.status}</div>;
  }

  const handleOrderNow = () => {
    // Redirect to order page without product info to allow selecting any product
    navigate('/order');
    onClose(); // Close the modal after navigating
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content product-detail-modal">
          <span className="close" onClick={onClose}>&times;</span>
          
          <div className="product-detail-info">
            <h2 className="product-detail-name">
              {product.name} <span className="product-unit">({product.unit})</span>
            </h2>
            
            <div className="product-detail-price">
              {formattedPrice}
            </div>
            
            {stockStatus && <div className="product-detail-stock">{stockStatus}</div>}
            
            {statusDisplay}
            
            {product.status === '販売中' && (
              <div className="product-detail-shipping">
                <i className="fas fa-truck"></i> {product.shippingEstimate}
              </div>
            )}
            
            {product.description && (
              <div className="product-detail-description">
                {product.description}
              </div>
            )}
            
            {product.details && (
              <div className="product-details">
                <h3>商品詳細</h3>
                <ul>
                  {Object.entries(product.details).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.status === '販売中' && product.stock > 0 ? (
              <div className="product-actions">
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={handleOrderNow}
                >
                  注文する
                </button>
              </div>
            ) : (
              <div className="out-of-stock-message">
                <p>この商品は現在購入できません。</p>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn" 
              onClick={onClose}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
