/**
 * Admin Products Utilities Module
 * Handles product import/export functionality
 */
const AdminProductsUtils = {
  /**
   * Download import template
   */
  downloadImportTemplate() {
    try {
      // Create CSV content
      const csvContent = 'ID,商品名,説明,価格,在庫数,単位,カテゴリ,状態,発送までの目安,在庫アラートしきい値,画像URL\n' +
        ',新鮮なアスパラ,美味しいアスパラです。,300,50,kg,アスパラ,販売中,ご注文から3〜5日以内に発送,10,https://example.com/asparagus.jpg\n' +
        ',純粋なはちみつ,甘くて美味しいはちみつです。,200,30,kg,はちみつ,販売中,ご注文から3〜5日以内に発送,5,https://example.com/honey.jpg';
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'products_import_template.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download template error:', error);
      alert(`テンプレートのダウンロードに失敗しました: ${error.message}`);
    }
  },
  
  /**
   * Import products from CSV
   */
  async importProducts() {
    try {
      const fileInput = document.getElementById('import-file');
      
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('インポートするCSVファイルを選択してください。');
        return;
      }
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          
          // Skip header row
          const dataRows = lines.slice(1).filter(line => line.trim() !== '');
          
          if (dataRows.length === 0) {
            alert('インポートするデータがありません。');
            return;
          }
          
          const updateExisting = document.getElementById('import-update-existing').checked;
          let importedCount = 0;
          let updatedCount = 0;
          let errorCount = 0;
          
          for (const row of dataRows) {
            try {
              // Parse CSV row (handle quoted values with commas)
              const values = [];
              let inQuotes = false;
              let currentValue = '';
              
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(currentValue);
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              
              values.push(currentValue); // Add the last value
              
              // Extract values
              const [id, name, description, price, stock, unit, category, status, shippingEstimate, lowStockThreshold, imagesStr] = values;
              
              // Validate required fields
              if (!name || !description || !price) {
                console.error('Required fields missing:', row);
                errorCount++;
                continue;
              }
              
              // Create product data
              const productData = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : 0,
                unit: unit ? unit.trim() : 'kg',
                category: category && ['アスパラ', 'はちみつ'].includes(category.trim()) 
                  ? category.trim() 
                  : 'アスパラ',
                status: status && ['販売中', '販売停止', '今季の販売は終了しました'].includes(status.trim())
                  ? status.trim()
                  : '販売中',
                shippingEstimate: shippingEstimate ? shippingEstimate.trim() : 'ご注文から3〜5日以内に発送',
                lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
                images: imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(url => url) : []
              };
              
              // Update or create product
              if (id && updateExisting) {
                await API.admin.updateProduct(id.trim(), productData);
                updatedCount++;
              } else {
                await API.admin.createProduct(productData);
                importedCount++;
              }
            } catch (rowError) {
              console.error('Error processing row:', row, rowError);
              errorCount++;
            }
          }
          
          // Reload products
          await AdminProducts.loadProducts();
          
          // Show success message
          alert(`インポート完了: ${importedCount} 件追加, ${updatedCount} 件更新, ${errorCount} 件エラー`);
          
          // Close modal
          const modal = document.getElementById('import-modal');
          if (modal) {
            modal.style.display = 'none';
            modal.remove();
          }
        } catch (parseError) {
          console.error('CSV parse error:', parseError);
          alert(`CSVの解析に失敗しました: ${parseError.message}`);
        }
      };
      
      reader.onerror = () => {
        alert('ファイルの読み込みに失敗しました。');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import products error:', error);
      alert(`商品のインポートに失敗しました: ${error.message}`);
    }
  }
};
