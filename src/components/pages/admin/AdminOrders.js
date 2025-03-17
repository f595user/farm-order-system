import React, { useState } from 'react';

const AdminOrders = ({ 
  orders, 
  filters, 
  onApplyFilters, 
  onViewOrderDetails, 
  onUpdateStatus,
  getStatusText,
  getPaymentStatusText
}) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    paymentStatus: filters.paymentStatus || '',
    search: filters.search || ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: '',
      paymentStatus: '',
      search: ''
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div id="admin-orders">
      <div className="admin-filters">
        <div className="filter-group">
          <label htmlFor="order-status-filter">ステータス:</label>
          <select 
            id="order-status-filter" 
            name="status"
            value={localFilters.status}
            onChange={handleFilterChange}
          >
            <option value="">すべて</option>
            <option value="pending">受付中</option>
            <option value="processing">準備中</option>
            <option value="shipped">発送済み</option>
            <option value="delivered">配達済み</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="order-payment-filter">支払い状況:</label>
          <select 
            id="order-payment-filter"
            name="paymentStatus"
            value={localFilters.paymentStatus}
            onChange={handleFilterChange}
          >
            <option value="">すべて</option>
            <option value="pending">未払い</option>
            <option value="paid">支払い済み</option>
            <option value="failed">支払い失敗</option>
            <option value="refunded">返金済み</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="order-search">検索:</label>
          <input 
            type="text" 
            id="order-search" 
            name="search"
            placeholder="顧客名、メール、注文番号"
            value={localFilters.search}
            onChange={handleFilterChange}
          />
        </div>
        <button className="btn" onClick={handleApplyFilters}>適用</button>
        <button className="btn" onClick={handleResetFilters}>リセット</button>
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>注文番号</th>
            <th>顧客</th>
            <th>日時</th>
            <th>金額</th>
            <th>支払い状況</th>
            <th>注文状態</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : '不明'}</td>
                <td>{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
                <td>
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                  }).format(order.totalAmount)}
                </td>
                <td>{getPaymentStatusText(order.paymentStatus)}</td>
                <td>{getStatusText(order.status)}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn view-order-btn" 
                      onClick={() => onViewOrderDetails(order._id)}
                    >
                      詳細
                    </button>
                    <button 
                      className="btn update-status-btn" 
                      onClick={() => onUpdateStatus(order._id)}
                    >
                      状態更新
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">注文が見つかりません</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
