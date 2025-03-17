import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

// Import components
import ProductCategory from '../order/ProductCategory';
import OrderSummary from '../order/OrderSummary';
import PaymentModal from '../order/PaymentModal';
import ConfirmationModal from '../order/ConfirmationModal';
import ShippingForm from '../order/ShippingForm';

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
  
  // State for category visibility - initialize as hidden (folded)
  const [categoryVisibility, setCategoryVisibility] = useState({});
  
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
          
          // Initialize all categories as hidden (folded)
          const categories = [...new Set(productList.map(product => product.category))];
          const initialVisibility = {};
          categories.forEach(category => {
            initialVisibility[category] = false;
          });
          setCategoryVisibility(initialVisibility);
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
          
          // Initialize all categories as hidden (folded)
          const categories = [...new Set(data.map(product => product.category))];
          const initialVisibility = {};
          categories.forEach(category => {
            initialVisibility[category] = false;
          });
          setCategoryVisibility(initialVisibility);
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
              <div key={destination.id}>
                <ShippingForm 
                  destination={destination}
                  onAddressChange={handleAddressChange}
                  onRemoveDestination={handleRemoveDestination}
                  products={products}
                  categoryVisibility={categoryVisibility}
                  onToggleCategory={(category) => setCategoryVisibility(prev => ({
                    ...prev, 
                    [category]: !prev[category]
                  }))}
                  onQuantityChange={handleQuantityChange}
                />
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
        <OrderSummary 
          destinations={destinations}
          products={products}
          totals={totals}
          loading={loading}
          onConfirmOrder={handleConfirmOrder}
        />
      </div>
      
      {/* Payment Method Selection Modal */}
      <PaymentModal
        show={showPaymentSelection}
        currentStep={currentStep}
        selectedPaymentMethod={selectedPaymentMethod}
        onClose={() => setShowPaymentSelection(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        onPaymentConfirm={handlePaymentConfirm}
        onPaymentBack={handlePaymentBack}
      />
      
      {/* Order Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmation}
        currentStep={currentStep}
        destinations={destinations}
        products={products}
        totals={totals}
        loading={loading}
        onClose={() => setShowConfirmation(false)}
        onConfirmationBack={handleConfirmationBack}
        onPlaceOrder={handlePlaceOrder}
      />
    </section>
  );
};

export default Order;
