import React, { useState } from 'react';

const UpdateStockModal = ({ product, onClose, onUpdateStock }) => {
  const [stock, setStock] = useState(product ? product.stock : 0);

  const handleChange = (e) => {
    setStock(parseInt(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStock(product._id, stock);
  };

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>在庫数の更新</h2>
          <div className="update-stock-form">
            <div className="product-info">
              <div className="product-name">{product.name}</div>
              <div className="product-category">{product.category}</div>
              <div className="product-stock">現在の在庫: {product.stock} {product.unit}</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="stock-quantity">新しい在庫数:</label>
                <input 
                  type="number" 
                  id="stock-quantity" 
                  value={stock}
                  onChange={handleChange}
                  min="0"
                  required
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

export default UpdateStockModal;
