/**
 * Admin Users Module
 * Handles user management functionality
 */
const AdminUsers = {
  /**
   * Load users
   */
  async loadUsers() {
    try {
      // Check if user is admin
      if (!Auth.isAdmin()) {
        return;
      }
      
      // Fetch users
      AdminCore.users = await API.admin.getUsers();
      
      // Render users
      this.renderUsers();
    } catch (error) {
      console.error('Load users error:', error);
      document.getElementById('admin-users').innerHTML = '<p>ユーザーの読み込みに失敗しました。</p>';
    }
  },

  /**
   * Render users
   */
  renderUsers() {
    const usersPanel = document.getElementById('admin-users');
    
    if (!usersPanel) {
      return;
    }
    
    // Create users content
    usersPanel.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>名前</th>
            <th>メールアドレス</th>
            <th>役割</th>
            <th>登録日</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${AdminCore.users.map(user => `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role === 'admin' ? '管理者' : '顧客'}</td>
              <td>${new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
              <td>
                <div class="admin-actions">
                  <button class="btn view-user-btn" data-id="${user._id}">詳細</button>
                  <button class="btn change-role-btn" data-id="${user._id}" data-role="${user.role}">
                    ${user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Add event listeners
    this.setupUsersEventListeners();
  },

  /**
   * Set up users event listeners
   */
  setupUsersEventListeners() {
    // View user buttons
    document.querySelectorAll('.view-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        this.viewUserDetails(userId);
      });
    });
    
    // Change role buttons
    document.querySelectorAll('.change-role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        const currentRole = btn.dataset.role;
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        this.changeUserRole(userId, newRole);
      });
    });
  },

  /**
   * View user details
   * @param {string} userId - User ID
   */
  async viewUserDetails(userId) {
    try {
      // Find user in users array
      const user = AdminCore.users.find(u => u._id === userId);
      
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
        this.changeUserRole(userId, newRole);
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
      alert('ユーザー詳細の読み込みに失敗しました。');
    }
  },

  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   */
  async changeUserRole(userId, newRole) {
    try {
      // Confirm role change
      if (!confirm(`このユーザーの役割を${newRole === 'admin' ? '管理者' : '顧客'}に変更してもよろしいですか？`)) {
        return;
      }
      
      // Update user role
      await API.admin.updateUserRole(userId, newRole);
      
      // Reload users
      await this.loadUsers();
      
      // Show success message
      alert('ユーザーの役割を更新しました。');
    } catch (error) {
      console.error('Change user role error:', error);
      alert(`ユーザーの役割の更新に失敗しました: ${error.message}`);
    }
  }
};
