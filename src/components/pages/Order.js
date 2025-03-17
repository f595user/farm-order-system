import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const Order = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get products from location state if available
  const initialProducts = location.state?.products || [];
  
  const [products, setProducts] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [nextDestinationId, setNextDestinationId] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Payment, 3: Confirmation
  
  // Use refs to store values that shouldn't trigger re-renders
  const currentUserRef = useRef(currentUser);
  const initialProductsRef = useRef(initialProducts);
  const addressPrefilledRef = useRef(false);
  const fetchCompletedRef = useRef(false);
  
  // Fetch products only once on component mount
  useEffect(() => {
    // Skip if we've already fetched
    if (fetchCompletedRef.current) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // If products were passed in location state, use those
        if (initialProductsRef.current.length > 0) {
          const productList = initialProductsRef.current.map(item => item.product);
          setProducts(productList);
          
          // Initialize first destination with these products
          const productQuantities = {};
          initialProductsRef.current.forEach(item => {
            productQuantities[item.product._id] = item.quantity;
          });
          
          setDestinations([{
            id: 1,
            name: currentUserRef.current?.name || '',
            phone: '',
            postalCode: '',
            city: '',
            address: '',
            products: productQuantities
          }]);
        } else {
          // Otherwise fetch all available products
          const data = await API.products.getAll({ inStock: true });
          console.log('Fetched products:', data);
          setProducts(data);
          
          // Initialize first destination with empty quantities
          const productQuantities = {};
          data.forEach(product => {
            productQuantities[product._id] = 0;
          });
          
          setDestinations([{
            id: 1,
            name: currentUserRef.current?.name || '',
            phone: '',
            postalCode: '',
            city: '',
            address: '',
            products: productQuantities
          }]);
        }
        
        // Mark fetch as completed to prevent re-fetching
        fetchCompletedRef.current = true;
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('商品の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []); // Empty dependency array - only run once on mount
  
  // Separate useEffect for pre-filling address that only runs once when loading is complete
  useEffect(() => {
    // Skip if we've already pre-filled or if still loading
    if (addressPrefilledRef.current || loading || !fetchCompletedRef.current) return;
    
    // Pre-fill address if user is logged in and we have destinations set up
    if (
      destinations.length > 0 && 
      isAuthenticated && 
      currentUser?.addresses?.length > 0
    ) {
      prefillAddressFromUser();
      addressPrefilledRef.current = true;
    }
  }, [loading]); // Only depend on loading state

  const prefillAddressFromUser = () => {
    if (!currentUser || !currentUser.addresses || currentUser.addresses.length === 0) {
      return;
    }
    
    // Get default address or first address
    const defaultAddress = currentUser.addresses.find(addr => addr.isDefault) || currentUser.addresses[0];
    
    // Only update if we have a destination and the address fields are empty
    const firstDestination = destinations[0];
    if (!firstDestination || 
        (firstDestination.name && firstDestination.address && firstDestination.postalCode)) {
      return;
    }
    
    // Update first destination with address data
    setDestinations(prevDestinations => {
      const updatedDestinations = [...prevDestinations];
      updatedDestinations[0] = {
        ...updatedDestinations[0],
        name: defaultAddress.name || currentUser.name || '',
        phone: defaultAddress.phone || '',
        postalCode: defaultAddress.postalCode || '',
        city: defaultAddress.city || '',
        address: defaultAddress.address || ''
      };
      return updatedDestinations;
    });
  };

  const handleQuantityChange = (destinationId, productId, newQuantity) => {
    console.log(`Changing quantity for product ${productId} to ${newQuantity} in destination ${destinationId}`);
    setDestinations(prevDestinations => {
      const updatedDestinations = prevDestinations.map(destination => {
        if (destination.id === destinationId) {
          const updatedProducts = {
            ...destination.products,
            [productId]: newQuantity
          };
          console.log('Updated products:', updatedProducts);
          return {
            ...destination,
            products: updatedProducts
          };
        }
        return destination;
      });
      console.log('Updated destinations:', updatedDestinations);
      return updatedDestinations;
    });
  };

  const handleAddressChange = (destinationId, field, value) => {
    setDestinations(prevDestinations => {
      return prevDestinations.map(destination => {
        if (destination.id === destinationId) {
          return {
            ...destination,
            [field]: value
          };
        }
        return destination;
      });
    });
  };

  const handleAddDestination = () => {
    // Create empty product quantities
    const productQuantities = {};
    products.forEach(product => {
      productQuantities[product._id] = 0;
    });
    
    // Add new destination
    setDestinations(prevDestinations => [
      ...prevDestinations,
      {
        id: nextDestinationId,
        name: '',
        phone: '',
        postalCode: '',
        city: '',
        address: '',
        products: productQuantities
      }
    ]);
    
    // Increment next ID
    setNextDestinationId(prevId => prevId + 1);
  };

  const handleRemoveDestination = (destinationId) => {
    // Cannot remove the first destination
    if (destinationId === 1) {
      alert('最初の配送先は削除できません。');
      return;
    }
    
    setDestinations(prevDestinations => 
      prevDestinations.filter(destination => destination.id !== destinationId)
    );
  };

  const handlePostalLookup = async (destinationId, postalCode) => {
    try {
      // Remove any non-digit characters
      const cleanPostalCode = postalCode.replace(/[^\d]/g, '');
      
      // Check if postal code is valid (7 digits for Japan)
      if (cleanPostalCode.length !== 7) {
        return;
      }
      
      // Format postal code as XXX-XXXX
      const formattedPostalCode = `${cleanPostalCode.substring(0, 3)}-${cleanPostalCode.substring(3)}`;
      
      // Call the Japanese postal code API
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanPostalCode}`);
      const data = await response.json();
      
      if (data.status !== 200 || !data.results || data.results.length === 0) {
        return;
      }
      
      // Get the first result
      const result = data.results[0];
      
      // Update destination with address data
      setDestinations(prevDestinations => {
        return prevDestinations.map(destination => {
          if (destination.id === destinationId) {
            return {
              ...destination,
              postalCode: formattedPostalCode,
              city: result.address1, // Prefecture
              address: `${result.address2}${result.address3}` // City + Street
            };
          }
          return destination;
        });
      });
    } catch (error) {
      console.error('Postal code lookup error:', error);
    }
  };

  const validateOrder = () => {
    // Check if any products are selected
    let hasProducts = false;
    
    for (const destination of destinations) {
      let destinationHasProducts = false;
      
      // Check if destination has products
      Object.values(destination.products).forEach(quantity => {
        if (quantity > 0) {
          hasProducts = true;
          destinationHasProducts = true;
        }
      });
      
      // Check if destination with products has address
      if (destinationHasProducts) {
        if (!destination.name || !destination.phone || !destination.postalCode || 
            !destination.city || !destination.address) {
          alert(`配送先 #${destination.id} の住所情報を入力してください。`);
          return false;
        }
      }
    }
    
    if (!hasProducts) {
      alert('商品が選択されていません。');
      return false;
    }
    
    return true;
  };

  const handleConfirmOrder = () => {
    if (!validateOrder()) {
      return;
    }
    
    // Show payment selection screen instead of confirmation
    setShowPaymentSelection(true);
    setCurrentStep(2); // Move to payment step
  };
  
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };
  
  const handlePaymentConfirm = () => {
    // Hide payment selection and show order confirmation
    setShowPaymentSelection(false);
    setShowConfirmation(true);
    setCurrentStep(3); // Move to confirmation step
  };
  
  const handlePaymentBack = () => {
    // Go back to order form
    setShowPaymentSelection(false);
    setCurrentStep(1); // Back to cart step
  };
  
  const handleConfirmationBack = () => {
    // Go back to payment selection
    setShowConfirmation(false);
    setShowPaymentSelection(true);
    setCurrentStep(2); // Back to payment step
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated()) {
      alert('注文を確定するにはログインしてください。');
      navigate('/login', { state: { from: location } });
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare order items
      const items = [];
      
      destinations.forEach(destination => {
        Object.entries(destination.products).forEach(([productId, quantity]) => {
          if (quantity > 0) {
            items.push({
              product: productId,
              quantity,
              shippingAddress: {
                name: destination.name,
                phone: destination.phone,
                address: destination.address,
                city: destination.city,
                postalCode: destination.postalCode
              }
            });
          }
        });
      });
      
      // Create order with selected payment method
      const orderData = {
        items,
        paymentMethod: selectedPaymentMethod
      };
      
      // Send order to API
      const order = await API.orders.create(orderData);
      
      // Close confirmation modal
      setShowConfirmation(false);
      
      // Show success message
      alert('ご注文ありがとうございます。注文が完了しました。');
      
      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message || '注文の処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for order summary
  const calculateTotals = () => {
    let totalItems = 0;
    let subtotal = 0;
    const shipping = 500; // Fixed shipping cost per destination
    
    // Check if any products are selected
    let hasProducts = false;
    let destinationsWithProducts = 0;
    
    destinations.forEach(destination => {
      let destinationHasProducts = false;
      
      Object.entries(destination.products).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          hasProducts = true;
          destinationHasProducts = true;
          
          const product = products.find(p => p._id === productId);
          if (product) {
            totalItems += quantity;
            subtotal += product.price * quantity;
          }
        }
      });
      
      if (destinationHasProducts) {
        destinationsWithProducts++;
      }
    });
    
    // Calculate total with shipping
    const total = subtotal + (shipping * destinationsWithProducts);
    
    return {
      totalItems,
      subtotal,
      shipping,
      total,
      hasProducts,
      destinationsWithProducts
    };
  };

  if (loading && products.length === 0) {
    return <div className="loading">商品を読み込み中...</div>;
  }

  // Only show error if we're still loading and have no products
  if (error && products.length === 0) {
    return <div className="error">{error}</div>;
  }

  const totals = calculateTotals();

  return (
    <section id="order-page">
      <h2>注文ページ</h2>
      
      <div className="order-container">
        {/* Shipping Destinations */}
        <div className="shipping-destinations">
          <h3>お届け先</h3>
          <div id="shipping-destinations-container">
            {destinations.map(destination => (
              <div 
                className="shipping-destination" 
                data-destination-id={destination.id}
                key={destination.id}
              >
                <div className="destination-header">
                  <h4>お届け先 #{destination.id}</h4>
                  {destination.id !== 1 && (
                    <button 
                      type="button" 
                      className="remove-destination-btn"
                      onClick={() => handleRemoveDestination(destination.id)}
                    >
                      <i className="fas fa-times"></i> 削除
                    </button>
                  )}
                </div>
                
                <div className="destination-form">
                  <div className="form-group name-group">
                    <label htmlFor={`name-${destination.id}`}>お名前</label>
                    <div className="name-input-container">
                      <input 
                        type="text" 
                        id={`name-${destination.id}`} 
                        name={`name-${destination.id}`}
                        value={destination.name}
                        onChange={(e) => handleAddressChange(destination.id, 'name', e.target.value)}
                        required 
                      />
                      <span className="name-suffix">様</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`postal-${destination.id}`}>郵便番号</label>
                    <input 
                      type="text" 
                      id={`postal-${destination.id}`} 
                      name={`postal-${destination.id}`}
                      value={destination.postalCode}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleAddressChange(destination.id, 'postalCode', value);
                      }}
                      onBlur={(e) => {
                        // Only lookup address when the field loses focus
                        handlePostalLookup(destination.id, e.target.value);
                      }}
                      placeholder="例: 123-4567"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`city-${destination.id}`}>都道府県</label>
                    <input 
                      type="text" 
                      id={`city-${destination.id}`} 
                      name={`city-${destination.id}`}
                      value={destination.city}
                      onChange={(e) => handleAddressChange(destination.id, 'city', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`address-${destination.id}`}>住所</label>
                    <input 
                      type="text" 
                      id={`address-${destination.id}`} 
                      name={`address-${destination.id}`}
                      value={destination.address}
                      onChange={(e) => handleAddressChange(destination.id, 'address', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`phone-${destination.id}`}>電話番号</label>
                    <input 
                      type="tel" 
                      id={`phone-${destination.id}`} 
                      name={`phone-${destination.id}`}
                      value={destination.phone}
                      onChange={(e) => handleAddressChange(destination.id, 'phone', e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="destination-products">
                  <h4>商品選択</h4>
                  <div className="product-selection-container">
                    {products.map(product => (
                      <div className="product-selection-item" key={product._id}>
                        <div className="product-selection-info">
                          <div className="product-selection-name">
                            {product.name} <span className="product-unit">({product.unit})</span>
                          </div>
                          <div className="product-selection-price">
                            {new Intl.NumberFormat('ja-JP', {
                              style: 'currency',
                              currency: 'JPY'
                            }).format(product.price)}
                          </div>
                        </div>
                        
                        <div className="product-selection-quantity">
                          <div className="quantity-selector">
                            <button 
                              type="button" 
                              className="quantity-btn decrease-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentQuantity = destination.products[product._id] || 0;
                                if (currentQuantity > 0) {
                                  handleQuantityChange(destination.id, product._id, currentQuantity - 1);
                                }
                              }}
                            >
                              -
                            </button>
                            
                            <input 
                              type="number" 
                              className="quantity-input"
                              value={destination.products[product._id] || 0}
                              min="0"
                              max={product.stock}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (isNaN(value) || value < 0) {
                                  handleQuantityChange(destination.id, product._id, 0);
                                } else if (value > product.stock) {
                                  handleQuantityChange(destination.id, product._id, product.stock);
                                } else {
                                  handleQuantityChange(destination.id, product._id, value);
                                }
                              }}
                              onClick={(e) => e.target.select()}
                            />
                            
                            <button 
                              type="button" 
                              className="quantity-btn increase-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentQuantity = destination.products[product._id] || 0;
                                if (currentQuantity < product.stock) {
                                  handleQuantityChange(destination.id, product._id, currentQuantity + 1);
                                }
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="add-destination-container">
            <button 
              id="add-destination-btn" 
              className="btn"
              onClick={handleAddDestination}
            >
              <i className="fas fa-plus"></i> 送り先を追加する
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="order-summary">
          <h3>注文内容</h3>
          <div id="order-summary-container">
            {!totals.hasProducts ? (
              <p>商品が選択されていません。</p>
            ) : (
              <>
                <div className="summary-item">
                  <span>商品点数:</span>
                  <span>{totals.totalItems}点</span>
                </div>
                
                {destinations.map(destination => {
                  // Check if destination has products
                  const destinationHasProducts = Object.values(destination.products).some(quantity => quantity > 0);
                  
                  if (!destinationHasProducts) {
                    return null;
                  }
                  
                  return (
                    <div className="summary-destination" key={destination.id}>
                      <div className="summary-destination-header">配送先 #{destination.id}</div>
                      
                      {destination.name && destination.address ? (
                        <div className="summary-destination-address">
                          {destination.name}<br />
                          {destination.postalCode} {destination.city} {destination.address}<br />
                          {destination.phone}
                        </div>
                      ) : (
                        <div className="summary-destination-address">住所が入力されていません</div>
                      )}
                      
                      {Object.entries(destination.products).map(([productId, quantity]) => {
                        if (quantity <= 0) {
                          return null;
                        }
                        
                        const product = products.find(p => p._id === productId);
                        if (!product) {
                          return null;
                        }
                        
                        const productTotal = product.price * quantity;
                        
                        return (
                          <div className="summary-product" key={productId}>
                            <div className="summary-product-name">{product.name}</div>
                            <div className="summary-product-quantity">{quantity}{product.unit}</div>
                            <div className="summary-product-price">
                              {new Intl.NumberFormat('ja-JP', {
                                style: 'currency',
                                currency: 'JPY'
                              }).format(productTotal)}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="summary-product">
                        <div className="summary-product-name">配送料</div>
                        <div className="summary-product-price">
                          {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: 'JPY'
                          }).format(totals.shipping)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="summary-subtotal summary-item">
                  <span>小計:</span>
                  <span>
                    {new Intl.NumberFormat('ja-JP', {
                      style: 'currency',
                      currency: 'JPY'
                    }).format(totals.subtotal)}
                  </span>
                </div>
                
                <div className="summary-total summary-item">
                  <span>合計:</span>
                  <span>
                    {new Intl.NumberFormat('ja-JP', {
                      style: 'currency',
                      currency: 'JPY'
                    }).format(totals.total)}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="order-actions">
            <button 
              id="back-to-products-btn" 
              className="btn"
              onClick={() => navigate('/products')}
            >
              商品一覧に戻る
            </button>
            
            <button 
              id="confirm-order-btn" 
              className="btn btn-primary"
              onClick={handleConfirmOrder}
              disabled={!totals.hasProducts || loading}
            >
              {loading ? '処理中...' : '注文を確定する'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Method Selection Modal */}
      {showPaymentSelection && (
        <div className="modal">
          <div className="modal-content">
            <span 
              className="close"
              onClick={() => setShowPaymentSelection(false)}
            >
              &times;
            </span>
            
            <h2>お支払い方法</h2>
            
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
                <div className="step-circle">1</div>
                <div className="step-label">カート</div>
              </div>
              <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">お支払い</div>
              </div>
              <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">確認</div>
              </div>
            </div>
            
            <div id="payment-selection-content">
              <h3>支払い方法を選択</h3>
              <div className="payment-options">
                <div 
                  className={`payment-option ${selectedPaymentMethod === 'credit_card' ? 'selected' : ''}`} 
                  data-method="credit_card"
                  onClick={() => handlePaymentMethodSelect('credit_card')}
                >
                  <div className="payment-option-radio">
                    <input 
                      type="radio" 
                      name="payment-method" 
                      id="payment-credit-card" 
                      checked={selectedPaymentMethod === 'credit_card'}
                      onChange={() => handlePaymentMethodSelect('credit_card')}
                    />
                    <label htmlFor="payment-credit-card"></label>
                  </div>
                  <div className="payment-option-details">
                    <div className="payment-option-name">クレジットカード</div>
                    <div className="payment-option-description">
                      <div className="credit-card-icons">
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-cc-amex"></i>
                        <i className="fab fa-cc-jcb"></i>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`payment-option ${selectedPaymentMethod === 'bank_transfer' ? 'selected' : ''}`} 
                  data-method="bank_transfer"
                  onClick={() => handlePaymentMethodSelect('bank_transfer')}
                >
                  <div className="payment-option-radio">
                    <input 
                      type="radio" 
                      name="payment-method" 
                      id="payment-bank-transfer"
                      checked={selectedPaymentMethod === 'bank_transfer'}
                      onChange={() => handlePaymentMethodSelect('bank_transfer')}
                    />
                    <label htmlFor="payment-bank-transfer"></label>
                  </div>
                  <div className="payment-option-details">
                    <div className="payment-option-name">銀行振込</div>
                    <div className="payment-option-description">
                      注文確認後、振込先情報をメールでお送りします。
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`payment-option ${selectedPaymentMethod === 'cash_on_delivery' ? 'selected' : ''}`} 
                  data-method="cash_on_delivery"
                  onClick={() => handlePaymentMethodSelect('cash_on_delivery')}
                >
                  <div className="payment-option-radio">
                    <input 
                      type="radio" 
                      name="payment-method" 
                      id="payment-cash-on-delivery"
                      checked={selectedPaymentMethod === 'cash_on_delivery'}
                      onChange={() => handlePaymentMethodSelect('cash_on_delivery')}
                    />
                    <label htmlFor="payment-cash-on-delivery"></label>
                  </div>
                  <div className="payment-option-details">
                    <div className="payment-option-name">代金引換</div>
                    <div className="payment-option-description">
                      商品お届け時に配送員に直接お支払いください。
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="checkout-actions">
                <button 
                  className="btn" 
                  id="payment-back-btn"
                  onClick={handlePaymentBack}
                >
                  戻る
                </button>
                <button 
                  className="btn btn-primary" 
                  id="payment-next-btn"
                  onClick={handlePaymentConfirm}
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <span 
              className="close"
              onClick={() => setShowConfirmation(false)}
            >
              &times;
            </span>
            
            <h2>注文確認</h2>
            
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
                <div className="step-circle">1</div>
                <div className="step-label">カート</div>
              </div>
              <div className={`step ${currentStep >= 2 ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">お支払い</div>
              </div>
              <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">確認</div>
              </div>
            </div>
            
            <div id="order-confirmation-content">
              <h3>注文内容の確認</h3>
              
              {destinations.map(destination => {
                // Check if destination has products
                const destinationHasProducts = Object.values(destination.products).some(quantity => quantity > 0);
                
                if (!destinationHasProducts) {
                  return null;
                }
                
                return (
                  <div className="summary-destination" key={destination.id}>
                    <div className="summary-destination-header">配送先 #{destination.id}</div>
                    
                    <div className="summary-destination-address">
                      {destination.name}<br />
                      {destination.postalCode} {destination.city} {destination.address}<br />
                      {destination.phone}
                    </div>
                    
                    {Object.entries(destination.products).map(([productId, quantity]) => {
                      if (quantity <= 0) {
                        return null;
                      }
                      
                      const product = products.find(p => p._id === productId);
                      if (!product) {
                        return null;
                      }
                      
                      const productTotal = product.price * quantity;
                      
                      return (
                        <div className="summary-product" key={productId}>
                          <div className="summary-product-name">{product.name}</div>
                          <div className="summary-product-quantity">{quantity}{product.unit}</div>
                          <div className="summary-product-price">
                            {new Intl.NumberFormat('ja-JP', {
                              style: 'currency',
                              currency: 'JPY'
                            }).format(productTotal)}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="summary-product">
                      <div className="summary-product-name">配送料</div>
                      <div className="summary-product-price">
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: 'JPY'
                        }).format(totals.shipping)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="summary-subtotal summary-item">
                <span>小計:</span>
                <span>
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(totals.subtotal)}
                </span>
              </div>
              
              <div className="summary-total summary-item">
                <span>合計:</span>
                <span>
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(totals.total)}
                </span>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <div className="confirmation-actions-left">
                <button 
                  id="back-to-payment-btn" 
                  className="btn"
                  onClick={handleConfirmationBack}
                >
                  戻る
                </button>
              </div>
              
              <div className="confirmation-actions-right">
                <button 
                  id="edit-order-btn" 
                  className="btn"
                  onClick={() => setShowConfirmation(false)}
                >
                  注文を編集する
                </button>
                
                <button 
                  id="place-order-btn" 
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? '処理中...' : '注文を確定する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Order;
