import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await API.products.getAll({ limit: 4 });
        setFeaturedProducts(products);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('商品の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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
          >
            今すぐ購入
          </button>
        </div>
      </div>

      <div className="featured-categories">
        <h3>カテゴリー</h3>
        <div className="category-grid">
          <div className="category-card">
            <img src="/images/アスパラ２" alt="アスパラ" />
            <h4>アスパラ</h4>
          </div>
          <div className="category-card">
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
          <div className="product-grid">
            {featuredProducts.map(product => (
              <div className="product-card" key={product._id}>
                <div className="product-image">
                  <img 
                    src={product.images && product.images.length > 0 
                      ? product.images[0] 
                      : '/images/placeholder.jpg'} 
                    alt={product.name} 
                  />
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">
                    {new Intl.NumberFormat('ja-JP', {
                      style: 'currency',
                      currency: 'JPY'
                    }).format(product.price)}
                  </p>
                  <Link to={`/products/${product._id}`} className="btn btn-primary">
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
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
