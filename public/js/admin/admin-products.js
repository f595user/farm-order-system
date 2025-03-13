/**
 * Admin Products Module
 * Handles product management functionality
 */
const AdminProducts = {
  /**
   * Load products
   */
  async loadProducts() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch products
      AdminCore.products = await API.products.getAll();
      
      // Render products
      this.renderProducts();
    } catch (error) {
      console.error('Load products error:', error);
      document.getElementById('admin-products').innerHTML = '<p>商品の読み込みに失敗しました。</p>';
    }
  },

  /**
   * Filter and sort products
   * @param {Array} products - Products to filter and sort
   * @param {Object} filters - Filter criteria
   * @param {Object} sort - Sort criteria
   * @returns {Array} - Filtered and sorted products
   */
  filterAndSortProducts(products, filters = {}, sort = { field: 'name', order: 'asc' }) {
    // Apply filters
    let filteredProducts = [...products];
    
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.status === filters.status);
    }
    
    if (filters.stock && filters.stock !== 'all') {
      if (filters.stock === 'inStock') {
        filteredProducts = filteredProducts.filter(product => product.stock > 0);
      } else if (filters.stock === 'outOfStock') {
        filteredProducts = filteredProducts.filter(product => product.stock === 0);
      } else if (filters.stock === 'lowStock') {
        filteredProducts = filteredProducts.filter(product => product.stock <= product.lowStockThreshold && product.stock > 0);
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
      let valueA, valueB;
      
      // Get values based on sort field
      switch (sort.field) {
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
      if (sort.order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filteredProducts;
  },

  /**
   * Render products
   */
  renderProducts() {
    const productsPanel = document.getElementById('admin-products');
    
    if (!productsPanel) {
      return;
    }
    
    // Get filter and sort values from DOM if they exist
    const filters = {
      category: document.getElementById('product-category-filter')?.value || 'all',
      status: document.getElementById('product-status-filter')?.value || 'all',
      stock: document.getElementById('product-stock-filter')?.value || 'all',
      search: document.getElementById('product-search')?.value || ''
    };
    
    const sort = {
      field: document.getElementById('product-sort-field')?.value || 'name',
      order: document.getElementById('product-sort-order')?.value || 'asc'
    };
    
    // Filter and sort products
    const filteredProducts = this.filterAndSortProducts(AdminCore.products, filters, sort);
    
    // Create products content
    productsPanel.innerHTML = `
      <div class="admin-actions-top">
        <div class="admin-actions-left">
          <button class="btn btn-primary" id="add-product-btn">新しい商品を追加</button>
          <button class="btn" id="bulk-actions-btn">一括操作</button>
          <button class="btn" id="export-products-btn">エクスポート</button>
          <button class="btn" id="import-products-btn">インポート</button>
        </div>
        <div class="admin-actions-right">
          <span class="product-count">${filteredProducts.length} 件の商品</span>
        </div>
      </div>
      
      <div class="admin-filters">
        <div class="filter-group">
          <input type="text" id="product-search" placeholder="商品を検索..." value="${filters.search}">
        </div>
        <div class="filter-group">
          <select id="product-category-filter">
            <option value="all" ${filters.category === 'all' ? 'selected' : ''}>すべてのカテゴリ</option>
            <option value="アスパラ" ${filters.category === 'アスパラ' ? 'selected' : ''}>アスパラ</option>
            <option value="はちみつ" ${filters.category === 'はちみつ' ? 'selected' : ''}>はちみつ</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-status-filter">
            <option value="all" ${filters.status === 'all' ? 'selected' : ''}>すべての状態</option>
            <option value="販売中" ${filters.status === '販売中' ? 'selected' : ''}>販売中</option>
            <option value="販売停止" ${filters.status === '販売停止' ? 'selected' : ''}>販売停止</option>
            <option value="今季の販売は終了しました" ${filters.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-stock-filter">
            <option value="all" ${filters.stock === 'all' ? 'selected' : ''}>すべての在庫状態</option>
            <option value="inStock" ${filters.stock === 'inStock' ? 'selected' : ''}>在庫あり</option>
            <option value="outOfStock" ${filters.stock === 'outOfStock' ? 'selected' : ''}>在庫切れ</option>
            <option value="lowStock" ${filters.stock === 'lowStock' ? 'selected' : ''}>在庫少</option>
          </select>
        </div>
        <div class="filter-group">
          <select id="product-sort-field">
            <option value="name" ${sort.field === 'name' ? 'selected' : ''}>商品名</option>
            <option value="price" ${sort.field === 'price' ? 'selected' : ''}>価格</option>
            <option value="stock" ${sort.field === 'stock' ? 'selected' : ''}>在庫数</option>
            <option value="category" ${sort.field === 'category' ? 'selected' : ''}>カテゴリ</option>
            <option value="createdAt" ${sort.field === 'createdAt' ? 'selected' : ''}>登録日</option>
          </select>
          <select id="product-sort-order">
            <option value="asc" ${sort.order === 'asc' ? 'selected' : ''}>昇順</option>
            <option value="desc" ${sort.order === 'desc' ? 'selected' : ''}>降順</option>
          </select>
        </div>
        <button class="btn" id="apply-product-filters">適用</button>
        <button class="btn" id="reset-product-filters">リセット</button>
      </div>
      
      <div class="bulk-actions-panel" style="display: none;">
        <div class="bulk-action-options">
          <select id="bulk-action-select">
            <option value="">一括操作を選択...</option>
            <option value="setOnSale">販売中に設定</option>
            <option value="setStopped">販売停止に設定</option>
            <option value="setSeasonEnded">今季の販売は終了しましたに設定</option>
            <option value="delete">削除</option>
            <option value="updateStock">在庫数更新</option>
          </select>
          <div id="bulk-stock-input" style="display: none;">
            <input type="number" id="bulk-stock-value" min="0" placeholder="新しい在庫数">
          </div>
          <button class="btn" id="apply-bulk-action">適用</button>
          <button class="btn" id="cancel-bulk-action">キャンセル</button>
        </div>
        <div class="bulk-action-info">
          <span>0 件選択中</span>
        </div>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" id="select-all-products">
            </th>
            <th>商品名</th>
            <th>カテゴリ</th>
            <th>価格</th>
            <th>在庫数</th>
            <th>状態</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${filteredProducts.length > 0 ? filteredProducts.map(product => `
            <tr class="${product.stock <= product.lowStockThreshold && product.stock > 0 ? 'low-stock' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}">
              <td>
                <input type="checkbox" class="product-select" data-id="${product._id}">
              </td>
              <td>${product.name}</td>
              <td>${AdminCore.getCategoryText(product.category)}</td>
              <td>${new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY'
              }).format(product.price)}</td>
              <td>
                <div class="stock-display">
                  <span class="stock-value ${product.stock <= product.lowStockThreshold ? 'low-stock-text' : ''}">${product.stock}</span> ${product.unit}
                  <div class="quick-stock-update">
                    <button class="btn btn-small decrement-stock" data-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>-</button>
                    <button class="btn btn-small increment-stock" data-id="${product._id}">+</button>
                  </div>
                </div>
              </td>
              <td>
                <div class="status-display">
                  <select class="status-select" data-id="${product._id}">
                    <option value="販売中" ${product.status === '販売中' ? 'selected' : ''}>販売中</option>
                    <option value="販売停止" ${product.status === '販売停止' ? 'selected' : ''}>販売停止</option>
                    <option value="今季の販売は終了しました" ${product.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
                  </select>
                </div>
              </td>
              <td>
                <div class="admin-actions">
                  <button class="btn edit-product-btn" data-id="${product._id}">編集</button>
                  <button class="btn update-stock-btn" data-id="${product._id}">在庫更新</button>
                  <button class="btn shipping-estimate-btn" data-id="${product._id}">発送目安</button>
                  <button class="btn delete-product-btn" data-id="${product._id}">削除</button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="7" class="no-products">
                <p>商品が見つかりません。フィルターを変更するか、新しい商品を追加してください。</p>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    `;
    
    // Add event listeners
    this.setupProductsEventListeners();
  },

  /**
   * Set up products event listeners
   */
  setupProductsEventListeners() {
    // Add product button
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
      AdminProductModal.showProductModal();
    });
    
    // Edit product buttons
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showProductModal(productId);
      });
    });
    
    // Update stock buttons
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showUpdateStockModal(productId);
      });
    });
    
    // Shipping estimate buttons
    document.querySelectorAll('.shipping-estimate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        AdminProductModal.showShippingEstimateModal(productId);
      });
    });
    
    // Delete product buttons
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        this.deleteProduct(productId);
      });
    });
    
    // Quick stock update buttons
    document.querySelectorAll('.increment-stock').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        const product = AdminCore.products.find(p => p._id === productId);
        if (product) {
          await this.updateProductStock(productId, product.stock + 1);
        }
      });
    });
    
    document.querySelectorAll('.decrement-stock').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        const product = AdminCore.products.find(p => p._id === productId);
        if (product && product.stock > 0) {
          await this.updateProductStock(productId, product.stock - 1);
        }
      });
    });
    
    // Status select
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async () => {
        const productId = select.dataset.id;
        const status = select.value;
        await this.updateProductStatus(productId, status);
      });
    });
    
    // Filter and sort controls
    document.getElementById('apply-product-filters')?.addEventListener('click', () => {
      this.renderProducts();
    });
    
    document.getElementById('reset-product-filters')?.addEventListener('click', () => {
      // Reset all filters and sort options
      if (document.getElementById('product-search')) {
        document.getElementById('product-search').value = '';
      }
      if (document.getElementById('product-category-filter')) {
        document.getElementById('product-category-filter').value = 'all';
      }
      if (document.getElementById('product-status-filter')) {
        document.getElementById('product-status-filter').value = 'all';
      }
      if (document.getElementById('product-stock-filter')) {
        document.getElementById('product-stock-filter').value = 'all';
      }
      if (document.getElementById('product-sort-field')) {
        document.getElementById('product-sort-field').value = 'name';
      }
      if (document.getElementById('product-sort-order')) {
        document.getElementById('product-sort-order').value = 'asc';
      }
      
      this.renderProducts();
    });
    
    // Bulk actions
    document.getElementById('bulk-actions-btn')?.addEventListener('click', () => {
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = bulkActionsPanel.style.display === 'none' ? 'flex' : 'none';
      }
    });
    
    document.getElementById('bulk-action-select')?.addEventListener('change', () => {
      const bulkAction = document.getElementById('bulk-action-select').value;
      const bulkStockInput = document.getElementById('bulk-stock-input');
      
      if (bulkAction === 'updateStock') {
        bulkStockInput.style.display = 'inline-block';
      } else {
        bulkStockInput.style.display = 'none';
      }
    });
    
    document.getElementById('apply-bulk-action')?.addEventListener('click', () => {
      this.applyBulkAction();
    });
    
    document.getElementById('cancel-bulk-action')?.addEventListener('click', () => {
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = 'none';
      }
      
      // Uncheck all checkboxes
      document.getElementById('select-all-products').checked = false;
      document.querySelectorAll('.product-select').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      this.updateSelectedCount();
    });
    
    // Select all products
    document.getElementById('select-all-products')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.product-select').forEach(checkbox => {
        checkbox.checked = isChecked;
      });
      
      this.updateSelectedCount();
    });
    
    // Individual product selection
    document.querySelectorAll('.product-select').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateSelectedCount();
        
        // Update "select all" checkbox state
        const allCheckboxes = document.querySelectorAll('.product-select');
        const checkedCheckboxes = document.querySelectorAll('.product-select:checked');
        
        document.getElementById('select-all-products').checked = 
          allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
      });
    });
    
    // Export products
    document.getElementById('export-products-btn')?.addEventListener('click', () => {
      this.exportProducts();
    });
    
    // Import products
    document.getElementById('import-products-btn')?.addEventListener('click', () => {
      AdminProductModal.showImportModal();
    });
  },
  
  /**
   * Update selected products count
   */
  updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.product-select:checked').length;
    const countDisplay = document.querySelector('.bulk-action-info span');
    
    if (countDisplay) {
      countDisplay.textContent = `${selectedCount} 件選択中`;
    }
  },
  
  /**
   * Apply bulk action to selected products
   */
  async applyBulkAction() {
    const selectedProducts = Array.from(document.querySelectorAll('.product-select:checked'))
      .map(checkbox => checkbox.dataset.id);
    
    if (selectedProducts.length === 0) {
      alert('操作を適用する商品を選択してください。');
      return;
    }
    
    const action = document.getElementById('bulk-action-select').value;
    
    if (!action) {
      alert('適用する操作を選択してください。');
      return;
    }
    
    // Confirm bulk action
    if (!confirm(`選択した ${selectedProducts.length} 件の商品に対して操作を実行してもよろしいですか？`)) {
      return;
    }
    
    try {
      switch (action) {
        case 'setOnSale':
          await this.bulkUpdateStatus(selectedProducts, '販売中');
          break;
        case 'setStopped':
          await this.bulkUpdateStatus(selectedProducts, '販売停止');
          break;
        case 'setSeasonEnded':
          await this.bulkUpdateStatus(selectedProducts, '今季の販売は終了しました');
          break;
        case 'delete':
          await this.bulkDeleteProducts(selectedProducts);
          break;
        case 'updateStock':
          const stockValue = parseInt(document.getElementById('bulk-stock-value').value);
          if (isNaN(stockValue) || stockValue < 0) {
            alert('有効な在庫数を入力してください。');
            return;
          }
          await this.bulkUpdateStock(selectedProducts, stockValue);
          break;
      }
      
      // Hide bulk actions panel and reload products
      const bulkActionsPanel = document.querySelector('.bulk-actions-panel');
      if (bulkActionsPanel) {
        bulkActionsPanel.style.display = 'none';
      }
      
      await this.loadProducts();
      
      // Show success message
      alert('一括操作が完了しました。');
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(`一括操作に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Bulk update product status
   * @param {Array} productIds - Product IDs
   * @param {string} status - Status value
   */
  async bulkUpdateStatus(productIds, status) {
    for (const productId of productIds) {
      await API.admin.updateProductStatus(productId, status);
    }
  },
  
  /**
   * Bulk delete products
   * @param {Array} productIds - Product IDs
   */
  async bulkDeleteProducts(productIds) {
    for (const productId of productIds) {
      await API.admin.deleteProduct(productId);
    }
  },
  
  /**
   * Bulk update product stock
   * @param {Array} productIds - Product IDs
   * @param {number} stock - New stock value
   */
  async bulkUpdateStock(productIds, stock) {
    for (const productId of productIds) {
      await API.admin.updateProductStock(productId, stock);
    }
  },
  
  /**
   * Update product status
   * @param {string} productId - Product ID
   * @param {string} status - Status value
   */
  async updateProductStatus(productId, status) {
    try {
      // Update product status
      await API.admin.updateProductStatus(productId, status);
      
      // Reload products
      await this.loadProducts();
    } catch (error) {
      console.error('Update product status error:', error);
      alert(`商品の状態の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Update product stock
   * @param {string} productId - Product ID
   * @param {number} stock - New stock value
   */
  async updateProductStock(productId, stock) {
    try {
      // Update product stock
      await API.admin.updateProductStock(productId, stock);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('在庫数を更新しました。');
    } catch (error) {
      console.error('Update product stock error:', error);
      alert(`在庫数の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Update shipping estimate
   * @param {string} productId - Product ID
   * @param {string} shippingEstimate - Shipping estimate text
   */
  async updateShippingEstimate(productId, shippingEstimate) {
    try {
      // Update shipping estimate
      await API.admin.updateShippingEstimate(productId, shippingEstimate);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('発送までの目安を更新しました。');
    } catch (error) {
      console.error('Update shipping estimate error:', error);
      alert(`発送までの目安の更新に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Create product
   * @param {Object} productData - Product data
   */
  async createProduct(productData) {
    try {
      // Validate product data
      if (!productData.name || !productData.description || isNaN(productData.price) || productData.price < 0) {
        throw new Error('商品名、説明、価格は必須です。');
      }
      
      // Create product
      await API.admin.createProduct(productData);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を追加しました。');
    } catch (error) {
      console.error('Create product error:', error);
      alert(`商品の追加に失敗しました: ${error.message}`);
    }
  },

  /**
   * Update product
   * @param {string} productId - Product ID
   * @param {Object} productData - Product data
   */
  async updateProduct(productId, productData) {
    try {
      // Validate product data
      if (!productData.name || !productData.description || isNaN(productData.price) || productData.price < 0) {
        throw new Error('商品名、説明、価格は必須です。');
      }
      
      // Update product
      await API.admin.updateProduct(productId, productData);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を更新しました。');
    } catch (error) {
      console.error('Update product error:', error);
      alert(`商品の更新に失敗しました: ${error.message}`);
    }
  },

  /**
   * Delete product
   * @param {string} productId - Product ID
   */
  async deleteProduct(productId) {
    try {
      if (!confirm('この商品を削除してもよろしいですか？')) {
        return;
      }
      
      // Delete product
      await API.admin.deleteProduct(productId);
      
      // Reload products
      await this.loadProducts();
      
      // Show success message
      alert('商品を削除しました。');
    } catch (error) {
      console.error('Delete product error:', error);
      alert(`商品の削除に失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Export products to CSV
   */
  exportProducts() {
    try {
      // Get filtered products
      const filters = {
        category: document.getElementById('product-category-filter')?.value || 'all',
        status: document.getElementById('product-status-filter')?.value || 'all',
        stock: document.getElementById('product-stock-filter')?.value || 'all',
        search: document.getElementById('product-search')?.value || ''
      };
      
      const sort = {
        field: document.getElementById('product-sort-field')?.value || 'name',
        order: document.getElementById('product-sort-order')?.value || 'asc'
      };
      
      const products = this.filterAndSortProducts(AdminCore.products, filters, sort);
      
      // Create CSV content
      let csvContent = 'ID,商品名,説明,価格,在庫数,単位,カテゴリ,状態,発送までの目安,在庫アラートしきい値,画像URL\n';
      
      products.forEach(product => {
        const row = [
          product._id,
          `"${product.name.replace(/"/g, '""')}"`,
          `"${product.description.replace(/"/g, '""')}"`,
          product.price,
          product.stock,
          product.unit,
          product.category,
          product.status,
          `"${product.shippingEstimate?.replace(/"/g, '""') || ''}"`,
          product.lowStockThreshold,
          `"${product.images.join(',').replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export products error:', error);
      alert(`商品のエクスポートに失敗しました: ${error.message}`);
    }
  }
};
