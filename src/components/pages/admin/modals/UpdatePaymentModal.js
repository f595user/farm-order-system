import React, { useState } from 'react';

const UpdatePaymentModal = ({ order, onClose, onUpdatePayment }) => {
  const [paymentStatus, setPaymentStatus] = useState(order ? order.paymentStatus : 'pending');
  const [transactionId, setTransactionId] = useState(
    order && order.paymentDetails && order.paymentDetails.transactionId 
      ? order.paymentDetails.transactionId 
      : ''
  );

  const handlePaymentStatusChange = (e) => {
    setPaymentStatus(e.target.value);
  };

  const handleTransactionIdChange = (e) => {
    setTransactionId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdatePayment(order._id, paymentStatus, transactionId);
  };

  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>支払い状況の更新</h2>
          <div className="update-payment-form">
            <div className="order-info">
              <div className="order-id">注文番号: {order._id}</div>
              <div className="order-customer">顧客: {order.user ? order.user.name : '不明'}</div>
              <div className="order-amount">
                金額: {new Intl.NumberFormat('ja-JP', {
                  style: 'currency',
                  currency: 'JPY'
                }).format(order.totalAmount)}
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="payment-status">支払い状況:</label>
                <select 
                  id="payment-status"
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                  required
                >
                  <option value="pending">未払い</option>
                  <option value="paid">支払い済み</option>
                  <option value="failed">支払い失敗</option>
                  <option value="refunded">返金済み</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transaction-id">取引ID:</label>
                <input 
                  type="text" 
                  id="transaction-id"
                  value={transactionId}
                  onChange={handleTransactionIdChange}
                  placeholder="取引IDを入力（任意）"
                />
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

export default UpdatePaymentModal;
