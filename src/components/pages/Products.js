import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/api';
import ProductDetailModal from './modals/ProductDetailModal';
import { useAuth } from '../../context/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Update category when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [location.search]);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache states
  const [productsCache, setProductsCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(0);
  const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Fetch products with caching
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters = {
        category: selectedCategory,
        search: searchTerm,
        inStock: inStockOnly ? 'true' : ''
      };
      
      // Check if we can use cache
      const useCache = !filters.category && !filters.search && !filters.inStock && 
                      productsCache && 
                      (Date.now() - cacheTimestamp < cacheDuration);
      
      let data;
      if (useCache) {
        console.log('Using cached products data');
        data = productsCache;
      } else {
        console.log('Fetching products from API');
        data = await API.products.getAll(filters);
        
        // Update cache if no filters are applied
        if (!filters.category && !filters.search && !filters.inStock) {
          setProductsCache(data);
          setCacheTimestamp(Date.now());
        }
      }
      
      console.log('Fetched products data:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Use mock data if API call fails
      console.log('Using mock data due to API error');
      const mockProducts = [
        {
          _id: '1',
          name: 'アスパラガス',
          description: '新鮮なアスパラガス',
          price: 2100,
          stock: 10,
          unit: '束',
          category: 'アスパラ',
          status: '販売中'
        },
        {
          _id: '2',
          name: 'はちみつ',
          description: '天然はちみつ',
          price: 4000,
          stock: 5,
          unit: '瓶',
          category: 'はちみつ',
          status: '販売中'
        }
      ];
      setProducts(mockProducts);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, inStockOnly, productsCache, cacheTimestamp, cacheDuration]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleStartOrder = () => {
    // Check if user is authenticated before navigating
    if (isAuthenticated()) {
      // If authenticated, navigate directly to order page
      navigate('/order');
    } else {
      // If not authenticated, navigate to login with state indicating 
      // we want to redirect to order page after login
      navigate('/login', { 
        state: { 
          from: '/products',
          startOrder: true 
        } 
      });
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section id="products">
      <div className="products-header">
        <h2>商品一覧</h2>
        <div className="filters">
          <div className="search-box">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                id="product-search" 
                placeholder="商品を検索..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn" id="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>
          <div className="category-filter">
            <select 
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">すべてのカテゴリー</option>
              <option value="アスパラ">アスパラ</option>
              <option value="はちみつ">はちみつ</option>
            </select>
          </div>
          <div className="stock-filter">
            <label>
              <input 
                type="checkbox" 
                id="in-stock-only"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              在庫あり商品のみ
            </label>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">商品を読み込み中...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>商品が見つかりませんでした。</p>
        </div>
      ) : (
        <>
          <div className="product-grid" id="all-products-grid">
            {products.map(product => {
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
                <div className="product-card" key={product._id} onClick={() => openProductModal(product)}>
                  {product.category === 'アスパラ' && (
                    <div className="category-badge asparagus">アスパラ</div>
                  )}
                  {product.category === 'はちみつ' && (
                    <div className="category-badge honey">はちみつ</div>
                  )}
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
                      <button 
                        className="btn view-product-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductModal(product);
                        }}
                      >
                        詳細
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="start-order-container">
            <button 
              className="btn btn-primary btn-large start-order-btn"
              onClick={handleStartOrder}
            >
              注文を開始する
            </button>
          </div>
        </>
      )}

      {isModalOpen && selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeProductModal} 
        />
      )}
    </section>
  );
};

export default Products;
