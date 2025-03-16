import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await API.products.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('商品の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleOrderNow = () => {
    // Redirect to order page with product info
    navigate('/order', { 
      state: { 
        products: [{ 
          product: product,
          quantity: quantity
        }] 
      } 
    });
  };

  if (loading) {
    return <div className="loading">商品を読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="not-found">商品が見つかりませんでした。</div>;
  }

  return (
    <section className="product-detail">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[0] 
                : '/images/placeholder.jpg'} 
              alt={product.name} 
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <div className="thumbnail" key={index}>
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h2 className="product-name">{product.name}</h2>
          
          <div className="product-price">
            {new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY'
            }).format(product.price)}
            <span className="product-unit">（{product.unit}）</span>
          </div>
          
          <div className="product-status">
            <span className={`status-badge ${product.status === '販売中' ? 'in-stock' : 'out-of-stock'}`}>
              {product.status}
            </span>
            <span className="stock-info">
              在庫: {product.stock} {product.unit}
            </span>
          </div>
          
          {product.description && (
            <div className="product-description">
              <h3>商品説明</h3>
              <p>{product.description}</p>
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
              <div className="quantity-selector">
                <label htmlFor="quantity">数量:</label>
                <div className="quantity-input-group">
                  <button 
                    type="button" 
                    className="quantity-btn" 
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity" 
                    min="1" 
                    max={product.stock} 
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                  <button 
                    type="button" 
                    className="quantity-btn" 
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
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
          
          {product.shippingEstimate && (
            <div className="shipping-info">
              <h3>配送について</h3>
              <p>{product.shippingEstimate}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="back-to-products">
        <button 
          className="btn" 
          onClick={() => navigate('/products')}
        >
          <i className="fas fa-arrow-left"></i> 商品一覧に戻る
        </button>
      </div>
    </section>
  );
};

export default ProductDetail;
