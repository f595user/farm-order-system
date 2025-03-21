import API from './api';

/**
 * Calculate total weight of products
 * @param {Array} products - Array of product objects
 * @param {Object} quantities - Object mapping product IDs to quantities
 * @returns {number} Total weight in kg
 */
export const calculateTotalWeight = (products, quantities) => {
  return Object.entries(quantities).reduce((total, [productId, quantity]) => {
    if (quantity <= 0) return total;
    
    const product = products.find(p => p._id === productId);
    if (!product) return total;
    
    // 単位に基づいて重量を kg に変換
    let weightInKg;
    if (product.unit === 'g') {
      weightInKg = product.weight / 1000; // g から kg への変換
      console.log(`Converting ${product.weight}g to ${weightInKg}kg for product ${product.name || productId}`);
    } else {
      weightInKg = product.weight; // すでに kg の場合
      console.log(`Using weight ${weightInKg}kg for product ${product.name || productId}`);
    }
    
    return total + (weightInKg * quantity);
  }, 0);
};

/**
 * Calculate shipping cost based on total weight and destination prefecture
 * @param {number|Array} totalWeightOrProducts - Total weight in kg or array of product objects with quantities
 * @param {string} prefecture - Destination prefecture
 * @returns {Promise<number>} Shipping cost
 */
export const calculateShippingCost = async (totalWeightOrProducts, prefecture) => {
  try {
    console.log('calculateShippingCost called with:', { totalWeightOrProducts, prefecture });
    
    if (!totalWeightOrProducts || !prefecture) {
      console.log('Missing required parameters, returning default cost');
      return 500; // Default shipping cost
    }
    
    // Check if first parameter is a number (totalWeight) or an array (products)
    if (typeof totalWeightOrProducts === 'number') {
      // First parameter is totalWeight
      const totalWeight = totalWeightOrProducts;
      console.log(`Calculating shipping for weight: ${totalWeight}kg to ${prefecture}`);
      
      // Call API to calculate shipping cost
      const requestData = {
        products: [{ productId: 'dummy', quantity: 1, weight: totalWeight }],
        prefecture
      };
      console.log('API request data:', requestData);
      
      const response = await API.post('/shipping/calculate', requestData);
      console.log('API response:', response.data);
      
      // Log the response for debugging
      console.log('API response object:', response);
      console.log('API response data:', response.data);
      
      // Check if response exists and has data
      if (!response) {
        console.error('Invalid API response - response is null or undefined');
        return 500; // Default shipping cost
      }
      
      // If response.data is the direct response (not wrapped in a data property)
      // This handles the case where the API returns the response directly
      const responseData = response.data || response;
      
      // Log the response data for debugging
      console.log('Response data type:', typeof responseData);
      console.log('Response data:', responseData);
      
      // Check if shippingCost exists in the response data
      if (responseData.shippingCost === undefined) {
        console.error('Missing shippingCost in response:', responseData);
        return 500; // Default shipping cost
      }
      
      // Convert shippingCost to a number if it's a string
      const cost = typeof responseData.shippingCost === 'string' 
        ? parseInt(responseData.shippingCost, 10) 
        : responseData.shippingCost;
      
      // Check if the converted cost is a valid number
      if (isNaN(cost)) {
        console.error('Invalid shippingCost value:', responseData.shippingCost);
        return 500; // Default shipping cost
      }
      
      console.log('Returning shipping cost:', cost);
      return cost;
    } else if (Array.isArray(totalWeightOrProducts)) {
      // First parameter is products array
      const products = totalWeightOrProducts;
      
      // Format products for API request
      const productItems = products.map(item => ({
        productId: item.productId || item._id,
        quantity: item.quantity
      }));
      
      const requestData = {
        products: productItems,
        prefecture
      };
      console.log('API request data:', requestData);
      
      // Call API to calculate shipping cost
      const response = await API.post('/shipping/calculate', requestData);
      console.log('API response:', response.data);
      
      // Log the response for debugging
      console.log('API response object:', response);
      console.log('API response data:', response.data);
      
      // Check if response exists and has data
      if (!response) {
        console.error('Invalid API response - response is null or undefined');
        return 500; // Default shipping cost
      }
      
      // If response.data is the direct response (not wrapped in a data property)
      // This handles the case where the API returns the response directly
      const responseData = response.data || response;
      
      // Log the response data for debugging
      console.log('Response data type:', typeof responseData);
      console.log('Response data:', responseData);
      
      // Check if shippingCost exists in the response data
      if (responseData.shippingCost === undefined) {
        console.error('Missing shippingCost in response:', responseData);
        return 500; // Default shipping cost
      }
      
      // Convert shippingCost to a number if it's a string
      const cost = typeof responseData.shippingCost === 'string' 
        ? parseInt(responseData.shippingCost, 10) 
        : responseData.shippingCost;
      
      // Check if the converted cost is a valid number
      if (isNaN(cost)) {
        console.error('Invalid shippingCost value:', responseData.shippingCost);
        return 500; // Default shipping cost
      }
      
      console.log('Returning shipping cost:', cost);
      return cost;
    } else {
      console.error('Invalid parameter type for calculateShippingCost');
      return 500; // Default shipping cost
    }
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    console.error('Error details:', error.message);
    return 500; // Default shipping cost on error
  }
};

/**
 * Get all shipping rates
 * @returns {Promise<Array>} Array of shipping rate objects
 */
export const getAllShippingRates = async () => {
  try {
    const response = await API.get('/shipping/rates');
    return response.data;
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return [];
  }
};

export default {
  calculateTotalWeight,
  calculateShippingCost,
  getAllShippingRates
};
