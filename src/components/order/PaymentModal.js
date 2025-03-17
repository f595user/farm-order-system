import React from 'react';

const PaymentModal = ({
  show,
  currentStep,
  selectedPaymentMethod,
  onClose,
  onPaymentMethodSelect,
  onPaymentConfirm,
  onPaymentBack
}) => {
  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span 
          className="close"
          onClick={onClose}
        >
          &times;
        </span>
        
        <h2>お支払い方法</h2>
        
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">差出人</div>
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
              onClick={() => onPaymentMethodSelect('credit_card')}
            >
              <div className="payment-option-radio">
                <input 
                  type="radio" 
                  name="payment-method" 
                  id="payment-credit-card" 
                  checked={selectedPaymentMethod === 'credit_card'}
                  onChange={() => onPaymentMethodSelect('credit_card')}
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
              onClick={() => onPaymentMethodSelect('bank_transfer')}
            >
              <div className="payment-option-radio">
                <input 
                  type="radio" 
                  name="payment-method" 
                  id="payment-bank-transfer"
                  checked={selectedPaymentMethod === 'bank_transfer'}
                  onChange={() => onPaymentMethodSelect('bank_transfer')}
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
              onClick={() => onPaymentMethodSelect('cash_on_delivery')}
            >
              <div className="payment-option-radio">
                <input 
                  type="radio" 
                  name="payment-method" 
                  id="payment-cash-on-delivery"
                  checked={selectedPaymentMethod === 'cash_on_delivery'}
                  onChange={() => onPaymentMethodSelect('cash_on_delivery')}
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
              onClick={onPaymentBack}
            >
              戻る
            </button>
            <button 
              className="btn btn-primary" 
              id="payment-next-btn"
              onClick={onPaymentConfirm}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
