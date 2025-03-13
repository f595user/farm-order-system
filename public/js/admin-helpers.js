/**
 * Admin Helper Functions
 * Contains utility functions for the admin module
 */

/**
 * Get status text
 * @param {string} status - Order status
 * @returns {string} Status text
 */
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return '受付中';
    case 'processing':
      return '準備中';
    case 'shipped':
      return '発送済み';
    case 'delivered':
      return '配達済み';
    case 'cancelled':
      return 'キャンセル';
    default:
      return '不明';
  }
}

/**
 * Get status class
 * @param {string} status - Order status
 * @returns {string} Status class
 */
function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'processing':
      return 'status-processing';
    case 'shipped':
      return 'status-shipped';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return '';
  }
}

/**
 * Get payment status text
 * @param {string} paymentStatus - Payment status
 * @returns {string} Payment status text
 */
function getPaymentStatusText(paymentStatus) {
  switch (paymentStatus) {
    case 'pending':
      return '未払い';
    case 'paid':
      return '支払い済み';
    case 'failed':
      return '支払い失敗';
    case 'refunded':
      return '返金済み';
    default:
      return '不明';
  }
}

/**
 * Get payment method text
 * @param {string} paymentMethod - Payment method
 * @returns {string} Payment method text
 */
function getPaymentMethodText(paymentMethod) {
  switch (paymentMethod) {
    case 'credit_card':
      return 'クレジットカード';
    case 'bank_transfer':
      return '銀行振込';
    case 'convenience_store':
      return 'コンビニ決済';
    case 'cash_on_delivery':
      return '代金引換';
    default:
      return '不明';
  }
}

/**
 * Get category text
 * @param {string} category - Product category
 * @returns {string} Category text
 */
function getCategoryText(category) {
  switch (category) {
    case 'vegetables':
      return '野菜';
    case 'fruits':
      return '果物';
    case 'grains':
      return '穀物';
    case 'dairy':
      return '乳製品';
    case 'other':
      return 'その他';
    default:
      return '不明';
  }
}

/**
 * Change user role
 * @param {string} userId - User ID
 * @param {string} newRole - New role
 */
async function changeUserRole(userId, newRole) {
  try {
    // Update user role
    await API.admin.updateUserRole(userId, newRole);
    
    // Reload users
    if (window.AdminModule && typeof window.AdminModule.loadUsers === 'function') {
      await window.AdminModule.loadUsers();
    } else {
      console.warn('AdminModule.loadUsers is not available, users list may not be updated');
    }
    
    // Show success message
    alert('ユーザー役割を更新しました。');
  } catch (error) {
    console.error('Change user role error:', error);
    alert(`ユーザー役割の更新に失敗しました: ${error.message}`);
  }
}

/**
 * View user details
 * @param {string} userId - User ID
 */
async function viewUserDetails(userId) {
  try {
    // Find user in users array
    const user = window.AdminModule && window.AdminModule.users ? 
      window.AdminModule.users.find(u => u._id === userId) : null;
    
    if (!user) {
      throw new Error('ユーザーが見つかりませんでした。');
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'user-details-modal';
    
    // Format date
    const registrationDate = new Date(user.createdAt);
    const formattedDate = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(registrationDate);
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>ユーザー詳細</h2>
        <div class="user-details">
          <div class="user-details-section">
            <h3>基本情報</h3>
            <div class="user-details-info">
              <div class="user-details-name">名前: ${user.name}</div>
              <div class="user-details-email">メール: ${user.email}</div>
              <div class="user-details-role">役割: ${user.role === 'admin' ? '管理者' : '顧客'}</div>
              <div class="user-details-date">登録日: ${formattedDate}</div>
            </div>
          </div>
          <div class="user-details-section">
            <h3>住所</h3>
            <div class="user-details-addresses">
              ${user.addresses && user.addresses.length > 0 ? user.addresses.map(address => `
                <div class="user-details-address">
                  <div class="user-details-address-name">${address.name}</div>
                  <div class="user-details-address-phone">${address.phone}</div>
                  <div class="user-details-address-location">${address.postalCode} ${address.city} ${address.address}</div>
                  ${address.isDefault ? '<div class="user-details-address-default">デフォルト</div>' : ''}
                </div>
              `).join('') : '<p>住所が登録されていません。</p>'}
            </div>
          </div>
          <div class="user-details-actions">
            <button class="btn change-role-btn" data-id="${userId}" data-role="${user.role}">
              ${user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
            </button>
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
    
    modal.querySelector('.change-role-btn').addEventListener('click', () => {
      const newRole = user.role === 'admin' ? 'customer' : 'admin';
      if (window.AdminModule && typeof window.AdminModule.changeUserRole === 'function') {
        window.AdminModule.changeUserRole(userId, newRole);
      } else {
        changeUserRole(userId, newRole);
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
    console.error('View user details error:', error);
    alert('ユーザー詳細の表示に失敗しました。');
  }
}

// Create AdminModule if it doesn't exist
if (typeof window.AdminModule === 'undefined') {
  window.AdminModule = {};
}

// Add helper functions to AdminModule
Object.assign(window.AdminModule, {
  getStatusText,
  getStatusClass,
  getPaymentStatusText,
  getPaymentMethodText,
  getCategoryText,
  changeUserRole,
  viewUserDetails
});

// Export functions for direct use
window.changeUserRole = changeUserRole;
window.viewUserDetails = viewUserDetails;

// Log that admin-helpers.js has been loaded
console.log('Admin helpers loaded successfully');
