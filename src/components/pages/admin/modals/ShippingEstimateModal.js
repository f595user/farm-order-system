import React, { useState } from 'react';

const ShippingEstimateModal = ({ product, onClose, onUpdateShippingEstimate }) => {
  const [shippingEstimate, setShippingEstimate] = useState(
    product && product.shippingEstimate 
      ? product.shippingEstimate 
      : 'ご注文から3〜5日以内に発送'
  );

  const handleChange = (e) => {
    setShippingEstimate(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateShippingEstimate(product._id, shippingEstimate);
  };

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>発送までの目安の設定</h2>
          <div className="shipping-estimate-form">
            <div className="product-info">
              <div className="product-name">{product.name}</div>
              <div className="product-category">{product.category}</div>
              <div className="product-status">状態: {product.status}</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="shipping-estimate">発送までの目安:</label>
                <input 
                  type="text" 
                  id="shipping-estimate"
                  value={shippingEstimate}
                  onChange={handleChange}
                  required
                />
                <div className="form-hint">例: ご注文から3〜5日以内に発送</div>
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

export default ShippingEstimateModal;
