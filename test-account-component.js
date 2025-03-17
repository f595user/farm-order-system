/**
 * Test script for the Account component with order history
 * This script directly renders the Account component with mock data
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { AuthProvider } = require('./src/context/AuthContext');
const Account = require('./src/components/pages/Account').default;

// Mock orders data
const mockOrders = [
  {
    _id: '67d7e11e0d067de9e130b768',
    status: 'pending',
    paymentMethod: 'credit_card',
    paymentStatus: 'pending',
    totalAmount: 5000,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    items: [
      {
        product: { name: 'アスパラガス' },
        quantity: 2,
        price: 1500
      },
      {
        product: { name: 'トマト' },
        quantity: 1,
        price: 2000
      }
    ]
  },
  {
    _id: '67d7e11e0d067de9e130b76d',
    status: 'processing',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    totalAmount: 3500,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    items: [
      {
        product: { name: 'じゃがいも' },
        quantity: 3,
        price: 800
      },
      {
        product: { name: 'にんじん' },
        quantity: 2,
        price: 550
      }
    ]
  },
  {
    _id: '67d7e11e0d067de9e130b772',
    status: 'shipped',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    totalAmount: 7200,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    items: [
      {
        product: { name: 'りんご' },
        quantity: 4,
        price: 1200
      },
      {
        product: { name: 'みかん' },
        quantity: 2,
        price: 1200
      }
    ]
  },
  {
    _id: '67d7e11e0d067de9e130b777',
    status: 'delivered',
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    totalAmount: 4500,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    items: [
      {
        product: { name: 'ほうれん草' },
        quantity: 2,
        price: 900
      },
      {
        product: { name: 'レタス' },
        quantity: 1,
        price: 700
      },
      {
        product: { name: 'きゅうり' },
        quantity: 3,
        price: 600
      }
    ]
  },
  {
    _id: '67d7e11e0d067de9e130b77c',
    status: 'cancelled',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'refunded',
    totalAmount: 3000,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    items: [
      {
        product: { name: 'なす' },
        quantity: 2,
        price: 800
      },
      {
        product: { name: 'ピーマン' },
        quantity: 1,
        price: 600
      },
      {
        product: { name: 'かぼちゃ' },
        quantity: 1,
        price: 800
      }
    ]
  }
];

// Mock user data
const mockUser = {
  id: '67c5ae6b1981923d2154f347',
  name: 'テストユーザー',
  email: 'test@example.com',
  addresses: [
    {
      _id: '67c5ae6b1981923d2154f348',
      name: 'テストユーザー',
      phone: '090-1234-5678',
      postalCode: '123-4567',
      city: '東京都',
      address: '渋谷区渋谷1-1-1',
      isDefault: true
    }
  ]
};

// Mock AuthContext
const mockAuthContext = {
  currentUser: mockUser,
  isAuthenticated: () => true,
  login: () => {},
  logout: () => {},
  register: () => {}
};

// Mock API
const mockAPI = {
  orders: {
    getAll: () => Promise.resolve(mockOrders),
    getById: (id) => Promise.resolve(mockOrders.find(order => order._id === id)),
    cancel: (id) => Promise.resolve({ ...mockOrders.find(order => order._id === id), status: 'cancelled' })
  },
  user: {
    updateProfile: (id, data) => Promise.resolve({ ...mockUser, ...data }),
    addAddress: (id, address) => Promise.resolve({ 
      ...mockUser, 
      addresses: [...mockUser.addresses, { _id: 'new-address-id', ...address }] 
    }),
    updateAddress: (id, addressId, data) => Promise.resolve({
      ...mockUser,
      addresses: mockUser.addresses.map(addr => 
        addr._id === addressId ? { ...addr, ...data } : addr
      )
    }),
    deleteAddress: (id, addressId) => Promise.resolve({
      ...mockUser,
      addresses: mockUser.addresses.filter(addr => addr._id !== addressId)
    })
  }
};

// Override the API import in the Account component
jest.mock('./src/utils/api', () => mockAPI);

// Create a wrapper component that provides the AuthContext
const TestWrapper = () => {
  return (
    <AuthProvider value={mockAuthContext}>
      <div className="test-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>アカウントコンポーネントテスト</h1>
        <Account />
      </div>
    </AuthProvider>
  );
};

// Render the component to the DOM
ReactDOM.render(<TestWrapper />, document.getElementById('root'));
