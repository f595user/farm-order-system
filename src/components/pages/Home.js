import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
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

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await API.announcements.getAll(3); // Limit to 3 announcements
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      // Don't set error state here to avoid blocking the entire page
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchAnnouncements();
  }, [fetchFeaturedProducts, fetchAnnouncements]);

  const handleShopNow = () => {
    window.scrollTo({
      top: document.getElementById('featured-products')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };
  
  // Facebook SDK initialization
  const [fbSDKError, setFbSDKError] = useState(false);
  const fbInitialized = useRef(false);
  
  useEffect(() => {
    // Simple error handler for Facebook SDK
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if ((source && source.includes('facebook')) || 
          (message && (message.includes('FB') || message.includes('facebook')))) {
        console.log('Suppressing Facebook error:', message);
        return true;
      }
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    // Function to manually parse Facebook elements
    const parseFacebookElements = () => {
      if (window.FB && !fbInitialized.current) {
        console.log('Manually parsing Facebook elements');
        window.FB.XFBML.parse();
        fbInitialized.current = true;
      }
    };
    
    // Load the Facebook SDK script directly
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v18.0&appId=';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => setFbSDKError(true);
    script.onload = () => {
      // Try parsing after script loads
      setTimeout(parseFacebookElements, 1000);
    };
    
    // Insert the script at the beginning of the body
    document.body.insertBefore(script, document.body.firstChild);
    
    // Also try parsing after component mounts completely
    setTimeout(parseFacebookElements, 2000);
    
    // Cleanup function
    return () => {
      window.onerror = originalOnError;
      const fbScript = document.getElementById('facebook-jssdk');
      if (fbScript) {
        document.body.removeChild(fbScript);
      }
      fbInitialized.current = false;
    };
  }, []);

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

      <div className="announcements">
        <h3>お知らせ</h3>
        <div className="announcements-container">
          {announcements.length > 0 ? (
            <div className="announcements-list">
              {announcements.map(announcement => {
                // Format date
                const postDate = new Date(announcement.postDate);
                const formattedDate = postDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                
                return (
                  <div className="announcement-card" key={announcement._id}>
                    <div className="announcement-header">
                      <h4 className="announcement-title">{announcement.title}</h4>
                      <div className="announcement-date">{formattedDate}</div>
                    </div>
                    <div className="announcement-content">
                      {announcement.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-announcements">
              <p>現在投稿はありません。</p>
            </div>
          )}
        </div>
      </div>

      <div className="location-info">
        <h3>場所</h3>
        <div className="location-container">
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2937.446919771797!2d141.4304133412501!3d42.58826047129259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f7515f85e11fa03%3A0x5e73fe847c86b9f6!2z44Ot44Oe44Oz44K56L6y5ZyS!5e0!3m2!1sja!2sjp!4v1729430750822!5m2!1sja!2sjp" 
              width="600" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="農園の場所"
              className="google-map"
            ></iframe>
          </div>
          <div className="location-details">
            <h4>ロマンス農園</h4>
            <p><i className="fas fa-map-marker-alt"></i> 〒059-1265 北海道苫小牧市樽前90</p>
            <p><i className="fas fa-clock"></i> 営業時間: 10:00〜16:00（シーズン無休）</p>
            <p><i className="fas fa-phone"></i> 0144-XX-XXXX</p>
            <p><i className="fas fa-envelope"></i> info@example.com</p>
            <p>北海道苫小牧市の自然豊かな環境で、こだわりの農産物を栽培しています。</p>
            <p>ぜひお気軽にお立ち寄りください。</p>
          </div>
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

      <div className="social-media">
        <h3>SNS</h3>
        
        {/* Facebook root div - required for FB SDK */}
        <div id="fb-root"></div>
        
        <div className="facebook-container">
          {fbSDKError ? (
            <div className="facebook-fallback">
              <h4>Facebook タイムラインを表示できません</h4>
              <p>代わりに、<a 
                href="https://www.facebook.com/profile.php?id=100057231948484"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook ページ
              </a>を直接ご覧ください。</p>
            </div>
          ) : (
            <>
              {/* Try both approaches: standard FB plugin and direct iframe */}
              <div 
                className="fb-page" 
                data-href="https://www.facebook.com/profile.php?id=100057231948484" 
                data-tabs="timeline"
                data-width="500" 
                data-height="700" 
                data-small-header="false" 
                data-adapt-container-width="true" 
                data-hide-cover="false" 
                data-show-facepile="true">
                <blockquote cite="https://www.facebook.com/profile.php?id=100057231948484" className="fb-xfbml-parse-ignore">
                  <a href="https://www.facebook.com/profile.php?id=100057231948484">Facebook</a>
                </blockquote>
              </div>
              
              {/* Direct iframe embed as fallback */}
              <div className="facebook-iframe-container">
                <iframe 
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100057231948484&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" 
                  width="500" 
                  height="700" 
                  style={{ 
                    border: 'none', 
                    overflow: 'hidden',
                    display: 'block',
                    margin: '0 auto',
                    maxWidth: '100%'
                  }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Timeline"
                ></iframe>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
