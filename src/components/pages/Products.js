import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, inStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const filters = {
        category: selectedCategory,
        inStock: inStockOnly
      };
      
      const data = await API.products.getAll(filters);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('商品の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    );
  });

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
      ) : filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>商品が見つかりませんでした。</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div className="product-card" key={product._id}>
              <div className="product-image">
                <img 
                  src={product.images && product.images.length > 0 
                    ? product.images[0] 
                    : '/images/placeholder.jpg'} 
                  alt={product.name} 
                />
                {product.stock <= 0 && (
                  <div className="out-of-stock-badge">売り切れ</div>
                )}
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
    </section>
  );
};

export default Products;
