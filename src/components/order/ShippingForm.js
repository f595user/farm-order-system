import React, { useEffect } from 'react';
import ProductCategory from './ProductCategory';

const ShippingForm = ({ 
  destination, 
  onAddressChange, 
  onRemoveDestination,
  products,
  categoryVisibility,
  onToggleCategory,
  onQuantityChange
}) => {
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
    
    onAddressChange(destination.id, 'postalCode', value);
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
    
    onAddressChange(destination.id, 'phone', value);
  };

  return (
    <div className="shipping-destination" data-destination-id={destination.id}>
      <div className="destination-header">
        <h4 className="destination-title">お届け先 #{destination.id}</h4>
        {destination.id !== 1 && (
          <button 
            type="button" 
            className="remove-destination-btn"
            onClick={() => onRemoveDestination(destination.id)}
          >
            <i className="fas fa-times"></i> 削除
          </button>
        )}
      </div>
      
      <div className="delivery-form">
        {/* 1行目: お名前 */}
        <div className="form-group name-group">
          <label htmlFor={`name-${destination.id}`}>お名前</label>
          <div className="name-input-container">
            <input 
              type="text" 
              id={`name-${destination.id}`} 
              name={`name-${destination.id}`}
              value={destination.name}
              onChange={(e) => onAddressChange(destination.id, 'name', e.target.value)}
              required 
            />
            <span className="name-suffix">様</span>
          </div>
        </div>
        
        {/* 2行目: 郵便番号 */}
        <div className="form-group">
          <label htmlFor={`postal-${destination.id}`}>郵便番号</label>
          <input 
            type="text" 
            id={`postal-${destination.id}`} 
            name={`postal-${destination.id}`}
            value={destination.postalCode}
            onChange={handlePostalCodeChange}
            placeholder="例: 123-4567"
            maxLength="8"
            required 
          />
        </div>
        
        {/* 3行目: 都道府県、住所 */}
        <div className="address-line">
          <div className="form-group prefecture-group">
            <label htmlFor={`city-${destination.id}`}>都道府県</label>
            <input 
              type="text" 
              id={`city-${destination.id}`} 
              name={`city-${destination.id}`}
              value={destination.city}
              onChange={(e) => onAddressChange(destination.id, 'city', e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group address-group">
            <label htmlFor={`address-${destination.id}`}>住所</label>
            <input 
              type="text" 
              id={`address-${destination.id}`} 
              name={`address-${destination.id}`}
              value={destination.address}
              onChange={(e) => onAddressChange(destination.id, 'address', e.target.value)}
              required 
            />
          </div>
        </div>
        
        {/* 4行目: 電話番号 */}
        <div className="form-group">
          <label htmlFor={`phone-${destination.id}`}>電話番号</label>
          <input 
            type="tel" 
            id={`phone-${destination.id}`} 
            name={`phone-${destination.id}`}
            value={destination.phone}
            onChange={handlePhoneChange}
            placeholder="例: 09012345678"
            maxLength="11"
            required 
          />
        </div>
      </div>
      
      {/* 商品選択欄 */}
      {products && products.length > 0 && (
        <div className="destination-products">
          <h4 className="product-selection-title">商品選択</h4>
          <div className="product-selection-container">
            {/* Group products by category */}
            {[...new Set(products.map(product => product.category))].map(category => (
              <ProductCategory
                key={category}
                category={category}
                products={products}
                isVisible={categoryVisibility?.[category] || false}
                onToggleVisibility={() => onToggleCategory && onToggleCategory(category)}
                destination={destination}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
