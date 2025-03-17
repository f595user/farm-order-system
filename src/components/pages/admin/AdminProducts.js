import React, { useState } from 'react';

const AdminProducts = ({ 
  products, 
  filters, 
  sort,
  onApplyFilters, 
  onAddProduct, 
  onEditProduct, 
  onUpdateStock,
  onUpdateShippingEstimate,
  onDeleteProduct,
  getCategoryText
}) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || 'all',
    status: filters.status || 'all',
    stock: filters.stock || 'all',
    search: filters.search || ''
  });

  const [localSort, setLocalSort] = useState({
    field: sort.field || 'name',
    order: sort.order || 'asc'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setLocalSort(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters, localSort);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: 'all',
      status: 'all',
      stock: 'all',
      search: ''
    };
    const resetSort = {
      field: 'name',
      order: 'asc'
    };
    setLocalFilters(resetFilters);
    setLocalSort(resetSort);
    onApplyFilters(resetFilters, resetSort);
  };

  // Filter and sort products locally
  const filteredProducts = [...products].filter(product => {
    // Apply category filter
    if (localFilters.category !== 'all' && product.category !== localFilters.category) {
      return false;
    }
    
    // Apply status filter
    if (localFilters.status !== 'all' && product.status !== localFilters.status) {
      return false;
    }
    
    // Apply stock filter
    if (localFilters.stock !== 'all') {
      if (localFilters.stock === 'inStock' && product.stock <= 0) {
        return false;
      } else if (localFilters.stock === 'outOfStock' && product.stock > 0) {
        return false;
      } else if (localFilters.stock === 'lowStock' && (product.stock > product.lowStockThreshold || product.stock <= 0)) {
        return false;
      }
    }
    
    // Apply search filter
    if (localFilters.search) {
      const searchLower = localFilters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) || 
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  }).sort((a, b) => {
    let valueA, valueB;
    
    // Get values based on sort field
    switch (localSort.field) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;
      case 'stock':
        valueA = a.stock;
        valueB = b.stock;
        break;
      case 'category':
        valueA = a.category;
        valueB = b.category;
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }
    
    // Compare values based on sort order
    if (localSort.order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  return (
    <div id="admin-products">
      <div className="admin-actions-top">
        <div className="admin-actions-left">
          <button className="btn btn-primary" onClick={onAddProduct}>新しい商品を追加</button>
        </div>
        <div className="admin-actions-right">
          <span className="product-count">{filteredProducts.length} 件の商品</span>
        </div>
      </div>
      
      <div className="admin-filters">
        <div className="filter-group">
          <input 
            type="text" 
            id="product-search" 
            name="search"
            placeholder="商品を検索..." 
            value={localFilters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <select 
            id="product-category-filter"
            name="category"
            value={localFilters.category}
            onChange={handleFilterChange}
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="アスパラ">アスパラ</option>
            <option value="はちみつ">はちみつ</option>
          </select>
        </div>
        <div className="filter-group">
          <select 
            id="product-status-filter"
            name="status"
            value={localFilters.status}
            onChange={handleFilterChange}
          >
            <option value="all">すべての状態</option>
            <option value="販売中">販売中</option>
            <option value="販売停止">販売停止</option>
            <option value="今季の販売は終了しました">今季の販売は終了しました</option>
          </select>
        </div>
        <div className="filter-group">
          <select 
            id="product-stock-filter"
            name="stock"
            value={localFilters.stock}
            onChange={handleFilterChange}
          >
            <option value="all">すべての在庫状態</option>
            <option value="inStock">在庫あり</option>
            <option value="outOfStock">在庫切れ</option>
            <option value="lowStock">在庫少</option>
          </select>
        </div>
        <div className="filter-group">
          <select 
            id="product-sort-field"
            name="field"
            value={localSort.field}
            onChange={handleSortChange}
          >
            <option value="name">商品名</option>
            <option value="price">価格</option>
            <option value="stock">在庫数</option>
            <option value="category">カテゴリ</option>
            <option value="createdAt">登録日</option>
          </select>
          <select 
            id="product-sort-order"
            name="order"
            value={localSort.order}
            onChange={handleSortChange}
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
        </div>
        <button className="btn" onClick={handleApplyFilters}>適用</button>
        <button className="btn" onClick={handleResetFilters}>リセット</button>
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>商品名</th>
            <th>カテゴリ</th>
            <th>価格</th>
            <th>在庫数</th>
            <th>状態</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <tr 
                key={product._id}
                className={`
                  ${product.stock <= product.lowStockThreshold && product.stock > 0 ? 'low-stock' : ''} 
                  ${product.stock === 0 ? 'out-of-stock' : ''}
                `}
              >
                <td>{product.name}</td>
                <td>{getCategoryText(product.category)}</td>
                <td>
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(product.price)}
                </td>
                <td>
                  <div className="stock-display">
                    <span className={`stock-value ${product.stock <= product.lowStockThreshold ? 'low-stock-text' : ''}`}>
                      {product.stock}
                    </span> {product.unit}
                  </div>
                </td>
                <td>{product.status}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn edit-product-btn" 
                      onClick={() => onEditProduct(product._id)}
                    >
                      編集
                    </button>
                    <button 
                      className="btn update-stock-btn" 
                      onClick={() => onUpdateStock(product._id)}
                    >
                      在庫更新
                    </button>
                    <button 
                      className="btn shipping-estimate-btn" 
                      onClick={() => onUpdateShippingEstimate(product._id)}
                    >
                      発送目安
                    </button>
                    <button 
                      className="btn delete-product-btn" 
                      onClick={() => onDeleteProduct(product._id)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-products">
                <p>商品が見つかりません。フィルターを変更するか、新しい商品を追加してください。</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
