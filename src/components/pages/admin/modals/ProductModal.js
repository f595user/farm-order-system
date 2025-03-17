import React, { useState } from 'react';

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product ? product.name : '',
    description: product ? product.description : '',
    price: product ? product.price : '',
    stock: product ? product.stock : 0,
    unit: product ? product.unit : 'kg',
    category: product ? product.category : 'アスパラ',
    status: product ? product.status : '販売中',
    shippingEstimate: product && product.shippingEstimate ? product.shippingEstimate : 'ご注文から3〜5日以内に発送',
    lowStockThreshold: product ? product.lowStockThreshold : 10
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'lowStockThreshold' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.description || isNaN(formData.price) || formData.price < 0) {
      alert('商品名、説明、価格は必須です。');
      return;
    }
    
    // Prepare product data
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      unit: formData.unit,
      category: formData.category,
      status: formData.status,
      shippingEstimate: formData.shippingEstimate,
      images: [], // Empty array for backward compatibility
      lowStockThreshold: parseInt(formData.lowStockThreshold)
    };
    
    onSave(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{product ? '商品の編集' : '新しい商品の追加'}</h2>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="product-name">商品名:</label>
              <input 
                type="text" 
                id="product-name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-description">説明:</label>
              <textarea 
                id="product-description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-price">価格:</label>
              <input 
                type="number" 
                id="product-price" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-stock">在庫数:</label>
              <input 
                type="number" 
                id="product-stock" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-unit">単位:</label>
              <input 
                type="text" 
                id="product-unit" 
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-category">カテゴリ:</label>
              <select 
                id="product-category" 
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="アスパラ">アスパラ</option>
                <option value="はちみつ">はちみつ</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product-status">状態:</label>
              <select 
                id="product-status" 
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="販売中">販売中</option>
                <option value="販売停止">販売停止</option>
                <option value="今季の販売は終了しました">今季の販売は終了しました</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product-shipping-estimate">発送までの目安:</label>
              <input 
                type="text" 
                id="product-shipping-estimate" 
                name="shippingEstimate"
                value={formData.shippingEstimate}
                onChange={handleChange}
              />
              <div className="form-hint">例: ご注文から3〜5日以内に発送</div>
            </div>
            <div className="form-group">
              <label htmlFor="product-threshold">在庫アラートしきい値:</label>
              <input 
                type="number" 
                id="product-threshold" 
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
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
  );
};

export default ProductModal;
