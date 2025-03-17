import React, { useState } from 'react';

const UpdateStatusModal = ({ order, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(order ? order.status : 'pending');

  const handleChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(order._id, status);
  };

  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>注文状態の更新</h2>
          <div className="update-status-form">
            <div className="order-info">
              <div className="order-id">注文番号: {order._id}</div>
              <div className="order-customer">顧客: {order.user ? order.user.name : '不明'}</div>
              <div className="order-date">日時: {new Date(order.createdAt).toLocaleString('ja-JP')}</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="order-status">注文状態:</label>
                <select 
                  id="order-status"
                  value={status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">受付中</option>
                  <option value="processing">準備中</option>
                  <option value="shipped">発送済み</option>
                  <option value="delivered">配達済み</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={onClose}>キャンセル</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
