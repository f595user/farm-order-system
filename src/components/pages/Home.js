import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache states
  const [productsCache, setProductsCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(0);
  const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we can use cache
      const useCache = productsCache && 
                      (Date.now() - cacheTimestamp < cacheDuration);
      
      let products;
      if (useCache) {
        console.log('Using cached products for featured products');
        products = productsCache.slice(0, 4);
      } else {
        console.log('Fetching products for featured products');
        products = await API.products.getAll({ limit: 4 });
        
        // Update cache
        setProductsCache(products);
        setCacheTimestamp(Date.now());
      }
      
      setFeaturedProducts(products);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('おすすめ商品の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [productsCache, cacheTimestamp, cacheDuration]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const handleShopNow = () => {
    window.scrollTo({
      top: document.getElementById('featured-products')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };

  return (
    <section id="home">
      <div className="hero">
        <div className="hero-content">
          <h2>苫小牧・樽前から新鮮な商品を直接お届け</h2>
          <p>北海道の大地から採れたてのアスパラをご自宅まで。</p>
          <p>品質と鮮度にこだわった商品をお届けします。</p>
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleShopNow}
            data-action="shop-now"
          >
            今すぐ購入
          </button>
        </div>
      </div>

      <div className="featured-categories">
        <h3>カテゴリー</h3>
        <div className="category-grid">
          <div 
            className="category-card" 
            data-category="アスパラ" 
            onClick={() => navigate('/products?category=アスパラ')}
            style={{ cursor: 'pointer' }}
          >
            <img src="/images/アスパラ２" alt="アスパラ" />
            <h4>アスパラ</h4>
          </div>
          <div 
            className="category-card" 
            data-category="はちみつ" 
            onClick={() => navigate('/products?category=はちみつ')}
            style={{ cursor: 'pointer' }}
          >
            <img src="/images/ハチミツ" alt="はちみつ" />
            <h4>はちみつ</h4>
          </div>
        </div>
      </div>

      <div className="featured-products" id="featured-products">
        <h3>おすすめ商品</h3>
        
        {loading ? (
          <div className="loading">商品を読み込み中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="product-grid" id="featured-products-grid">
            {featuredProducts.map(product => {
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
                statusDisplay = <div className="product-status">{product.status}</div>;
              }
              
              return (
                <div className="product-card" key={product._id}>
                  <Link to={`/products/${product._id}`}>
                    <div className="product-info">
                      <h3 className="product-name">
                        {product.name} <span className="product-unit">({product.unit})</span>
                      </h3>
                      <div className="product-price">{formattedPrice}</div>
                      {stockStatus && <div className="product-stock">{stockStatus}</div>}
                      {product.shippingEstimate && (
                        <div className="product-shipping-estimate">
                          <i className="fas fa-truck"></i> {product.shippingEstimate}
                        </div>
                      )}
                      {statusDisplay}
                      <div className="product-actions">
                        <button className="btn view-product-btn">
                          詳細
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="view-all-products">
          <Link to="/products" className="btn">
            すべての商品を見る <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
