import React from 'react';

const ProductCategory = ({ 
  category, 
  products, 
  isVisible, 
  onToggleVisibility, 
  destination, 
  onQuantityChange 
}) => {
  return (
    <div className="product-category" key={category}>
      <div 
        className="category-header" 
        onClick={onToggleVisibility}
      >
        <h5>{category}</h5>
        <span className="category-toggle">
          {isVisible ? '▼' : '▶'}
        </span>
      </div>
      
      <div className={`category-products ${isVisible ? 'visible' : 'hidden'}`}>
        {products
          .filter(product => product.category === category)
          .map(product => (
            <div className="product-selection-item" key={product._id}>
              <div className="product-selection-info">
                <div className="product-selection-name">
                  {product.name} <span className="product-unit">({product.unit})</span>
                </div>
              </div>
              
              <div className="product-selection-quantity">
                <div className="product-selection-price">
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(product.price)}
                </div>
                <div className="quantity-selector">
                  <button 
                    type="button" 
                    className="quantity-btn decrease-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentQuantity = destination.products[product._id] || 0;
                      if (currentQuantity > 0) {
                        onQuantityChange(destination.id, product._id, currentQuantity - 1);
                      }
                    }}
                  >
                    -
                  </button>
                  
                  <input 
                    type="number" 
                    className="quantity-input"
                    value={destination.products[product._id] || 0}
                    min="0"
                    max={product.stock}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 0) {
                        onQuantityChange(destination.id, product._id, 0);
                      } else if (value > product.stock) {
                        onQuantityChange(destination.id, product._id, product.stock);
                      } else {
                        onQuantityChange(destination.id, product._id, value);
                      }
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  
                  <button 
                    type="button" 
                    className="quantity-btn increase-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentQuantity = destination.products[product._id] || 0;
                      if (currentQuantity < product.stock) {
                        onQuantityChange(destination.id, product._id, currentQuantity + 1);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default ProductCategory;
