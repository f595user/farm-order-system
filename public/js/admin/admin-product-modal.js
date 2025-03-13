/**
 * Admin Product Modal Module
 * Handles product modal functionality for adding and editing products
 */
const AdminProductModal = {
  /**
   * Show product modal for adding or editing a product
   * @param {string} productId - Product ID for editing, null for adding
   */
  async showProductModal(productId = null) {
    try {
      let product = null;
      
      if (productId) {
        // Fetch product details for editing
        product = await API.products.getById(productId);
      }
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'product-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>${productId ? '商品の編集' : '新しい商品の追加'}</h2>
          <div class="product-form">
            <div class="form-group">
              <label for="product-name">商品名:</label>
              <input type="text" id="product-name" value="${product ? product.name : ''}">
            </div>
            <div class="form-group">
              <label for="product-description">説明:</label>
              <textarea id="product-description">${product ? product.description : ''}</textarea>
            </div>
            <div class="form-group">
              <label for="product-price">価格:</label>
              <input type="number" id="product-price" value="${product ? product.price : ''}" min="0">
            </div>
            <div class="form-group">
              <label for="product-stock">在庫数:</label>
              <input type="number" id="product-stock" value="${product ? product.stock : '0'}" min="0">
            </div>
            <div class="form-group">
              <label for="product-unit">単位:</label>
              <input type="text" id="product-unit" value="${product ? product.unit : 'kg'}">
            </div>
            <div class="form-group">
              <label for="product-category">カテゴリ:</label>
              <select id="product-category">
                <option value="アスパラ" ${product && product.category === 'アスパラ' ? 'selected' : ''}>アスパラ</option>
                <option value="はちみつ" ${product && product.category === 'はちみつ' ? 'selected' : ''}>はちみつ</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-status">状態:</label>
              <select id="product-status">
                <option value="販売中" ${!product || product.status === '販売中' ? 'selected' : ''}>販売中</option>
                <option value="販売停止" ${product && product.status === '販売停止' ? 'selected' : ''}>販売停止</option>
                <option value="今季の販売は終了しました" ${product && product.status === '今季の販売は終了しました' ? 'selected' : ''}>今季の販売は終了しました</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-shipping-estimate">発送までの目安:</label>
              <input type="text" id="product-shipping-estimate" value="${product && product.shippingEstimate ? product.shippingEstimate : 'ご注文から3〜5日以内に発送'}">
              <div class="form-hint">例: ご注文から3〜5日以内に発送</div>
            </div>
            <div class="form-group">
              <label for="product-images">画像URL (カンマ区切り):</label>
              <input type="text" id="product-images" value="${product && product.images ? product.images.join(',') : ''}">
            </div>
            <div class="form-group">
              <label for="product-threshold">在庫アラートしきい値:</label>
              <input type="number" id="product-threshold" value="${product ? product.lowStockThreshold : '10'}" min="0">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-product">キャンセル</button>
              <button class="btn btn-primary" id="save-product" data-id="${productId || ''}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-product').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-product').addEventListener('click', async () => {
        const productData = {
          name: document.getElementById('product-name').value,
          description: document.getElementById('product-description').value,
          price: parseFloat(document.getElementById('product-price').value),
          stock: parseInt(document.getElementById('product-stock').value),
          unit: document.getElementById('product-unit').value,
          category: document.getElementById('product-category').value,
          status: document.getElementById('product-status').value,
          shippingEstimate: document.getElementById('product-shipping-estimate').value,
          images: document.getElementById('product-images').value.split(',').map(url => url.trim()).filter(url => url),
          lowStockThreshold: parseInt(document.getElementById('product-threshold').value)
        };
        
        if (productId) {
          await AdminProducts.updateProduct(productId, productData);
        } else {
          await AdminProducts.createProduct(productData);
        }
        
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show product modal error:', error);
      alert('商品モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show update stock modal
   * @param {string} productId - Product ID
   */
  async showUpdateStockModal(productId) {
    try {
      // Fetch product details
      const product = await API.products.getById(productId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'update-stock-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>在庫数の更新</h2>
          <div class="update-stock-form">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-category">${AdminCore.getCategoryText(product.category)}</div>
              <div class="product-stock">現在の在庫: ${product.stock} ${product.unit}</div>
            </div>
            <div class="form-group">
              <label for="stock-quantity">新しい在庫数:</label>
              <input type="number" id="stock-quantity" value="${product.stock}" min="0">
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-update-stock">キャンセル</button>
              <button class="btn btn-primary" id="save-update-stock" data-id="${productId}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-update-stock').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-update-stock').addEventListener('click', async () => {
        const stock = parseInt(document.getElementById('stock-quantity').value);
        await AdminProducts.updateProductStock(productId, stock);
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show update stock modal error:', error);
      alert('在庫数の更新モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show shipping estimate modal
   * @param {string} productId - Product ID
   */
  async showShippingEstimateModal(productId) {
    try {
      // Fetch product details
      const product = await API.products.getById(productId);
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'shipping-estimate-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>発送までの目安の設定</h2>
          <div class="shipping-estimate-form">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-category">${AdminCore.getCategoryText(product.category)}</div>
              <div class="product-status">状態: ${product.status}</div>
            </div>
            <div class="form-group">
              <label for="shipping-estimate">発送までの目安:</label>
              <input type="text" id="shipping-estimate" value="${product.shippingEstimate || 'ご注文から3〜5日以内に発送'}">
              <div class="form-hint">例: ご注文から3〜5日以内に発送</div>
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-shipping-estimate">キャンセル</button>
              <button class="btn btn-primary" id="save-shipping-estimate" data-id="${productId}">保存</button>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-shipping-estimate').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#save-shipping-estimate').addEventListener('click', async () => {
        const shippingEstimate = document.getElementById('shipping-estimate').value;
        await AdminProducts.updateShippingEstimate(productId, shippingEstimate);
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show shipping estimate modal error:', error);
      alert('発送目安の設定モーダルの表示に失敗しました。');
    }
  },

  /**
   * Show import modal
   */
  showImportModal() {
    try {
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'import-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>商品のインポート</h2>
          <div class="import-form">
            <p>CSVファイルから商品をインポートします。CSVファイルは以下の列を含む必要があります：</p>
            <ul>
              <li>商品名 (必須)</li>
              <li>説明 (必須)</li>
              <li>価格 (必須)</li>
              <li>在庫数</li>
              <li>単位</li>
              <li>カテゴリ (アスパラ, はちみつ のいずれか)</li>
              <li>状態 (販売中, 販売停止, 今季の販売は終了しました)</li>
              <li>発送までの目安</li>
              <li>在庫アラートしきい値</li>
              <li>画像URL (カンマ区切り)</li>
            </ul>
            <div class="form-group">
              <label for="import-file">CSVファイル:</label>
              <input type="file" id="import-file" accept=".csv">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="import-update-existing">
                既存の商品を更新する (IDで一致する場合)
              </label>
            </div>
            <div class="form-actions">
              <button class="btn" id="cancel-import">キャンセル</button>
              <button class="btn btn-primary" id="start-import">インポート</button>
            </div>
            <div class="import-template">
              <a href="#" id="download-template">インポート用テンプレートをダウンロード</a>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body
      document.body.appendChild(modal);
      
      // Show modal
      modal.style.display = 'block';
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      modal.querySelector('#cancel-import').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });
      
      // Download template
      modal.querySelector('#download-template').addEventListener('click', (e) => {
        e.preventDefault();
        AdminProducts.downloadImportTemplate();
      });
      
      // Start import
      modal.querySelector('#start-import').addEventListener('click', () => {
        AdminProducts.importProducts();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Show import modal error:', error);
      alert(`インポートモーダルの表示に失敗しました: ${error.message}`);
    }
  }
};
