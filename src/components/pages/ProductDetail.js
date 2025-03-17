import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product with error handling
  const fetchProduct = useCallback(async () => {
    if (!id) {
      setError('商品IDが見つかりません。');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching product details for ID:', id);
      setLoading(true);
      const data = await API.products.getById(id);
      
      if (!data) {
        throw new Error('Product data is empty or invalid');
      }
      
      console.log('Product details received:', data);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('商品詳細の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleOrderNow = () => {
    // Redirect to order page with product info
    navigate('/order', { 
      state: { 
        products: [{ 
          product: product,
          quantity: 1
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

  return (
    <section className="product-detail">
      <div className="product-detail-container">
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
