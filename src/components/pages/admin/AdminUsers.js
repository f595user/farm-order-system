import React from 'react';

const AdminUsers = ({ 
  users, 
  onViewUserDetails, 
  onChangeUserRole 
}) => {
  return (
    <div id="admin-users">
      <table className="admin-table">
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
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === 'admin' ? '管理者' : '顧客'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn view-user-btn" 
                      onClick={() => onViewUserDetails(user._id)}
                    >
                      詳細
                    </button>
                    <button 
                      className="btn change-role-btn" 
                      onClick={() => onChangeUserRole(user._id, user.role === 'admin' ? 'customer' : 'admin')}
                    >
                      {user.role === 'admin' ? '顧客に変更' : '管理者に変更'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">ユーザーが見つかりません</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
