# React Integration Guide for Enhanced API

This guide demonstrates how to integrate the enhanced API with timeout handling into your React application.

## Option 1: Replace the entire API module

In `src/utils/api.js`, replace the entire file with:

```javascript
import EnhancedAPI from '../../public/js/api-timeout-fix';
export default EnhancedAPI;
```

This approach completely replaces your existing API with the enhanced version. All existing code that imports from `src/utils/api.js` will automatically use the enhanced API with timeout handling and caching.

## Option 2: Selective integration

If you prefer to selectively integrate the enhanced API, you can import specific functions from the enhanced API and use them in your components:

Example component using the enhanced API:

```jsx
import React, { useState, useEffect } from 'react';
import EnhancedAPI from '../../public/js/api-timeout-fix';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Use the enhanced API with caching
        const data = await EnhancedAPI.products.getAll({}, 1, 20, true);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle timeout errors with a user-friendly message
  if (error) {
    return (
      <div className="error-container">
        <h2>エラーが発生しました</h2>
        <p>{error.includes('timed out') ? 
          'サーバーからの応答に時間がかかりすぎています。後でもう一度お試しください。' : 
          error}
        </p>
        <button onClick={() => window.location.reload()}>再試行</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="product-list">
      <h1>商品一覧</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.price}円</p>
            {/* Other product details */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
```

## Option 3: Context API Integration

For more advanced applications, you might want to use React Context to provide the enhanced API throughout your application:

In `src/context/ApiContext.js`:

```jsx
import React, { createContext, useContext } from 'react';
import EnhancedAPI from '../../public/js/api-timeout-fix';

// Create the API context
const ApiContext = createContext(null);

// Provider component
export const ApiProvider = ({ children }) => {
  return (
    <ApiContext.Provider value={EnhancedAPI}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API
export const useApi = () => {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return api;
};
```

Then in your `App.js`:

```jsx
import { ApiProvider } from './context/ApiContext';

function App() {
  return (
    <ApiProvider>
      {/* Your app components */}
    </ApiProvider>
  );
}
```

And in your components:

```jsx
import { useApi } from '../context/ApiContext';

function ProductList() {
  const api = useApi();
  // Now use api.products.getAll() etc.
}
```

## Handling Timeout Errors

The enhanced API will throw specific errors for timeouts. Here's how to handle them in your components:

```javascript
try {
  const data = await EnhancedAPI.products.getAll();
  // Process data
} catch (error) {
  if (error.message.includes('timed out')) {
    // Handle timeout specifically
    console.error('Request timed out:', error);
    // Show user-friendly message
    // Maybe retry with increased timeout
  } else {
    // Handle other errors
    console.error('API error:', error);
  }
}
```

## Using Caching Effectively

The enhanced API includes caching for GET requests. Here's how to use it effectively:

### 1. For data that rarely changes (e.g., product categories):

```javascript
const categories = await EnhancedAPI.getCached('/products/categories', {
  useCache: true,
  cacheTTL: 30 * 60 * 1000 // 30 minutes
});
```

### 2. For data that changes more frequently (e.g., product stock):

```javascript
const product = await EnhancedAPI.products.getById(productId, false); // Don't use cache
```

### 3. To manually clear cache when needed:

```javascript
EnhancedAPI.clearCacheForEndpoint('/products');
// or
EnhancedAPI.clearCache(); // Clear all cache
