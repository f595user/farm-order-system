import React from 'react';

const ShippingForm = ({ 
  destination, 
  onAddressChange, 
  onRemoveDestination 
}) => {
  return (
    <div className="shipping-destination" data-destination-id={destination.id}>
      <div className="destination-header">
        <h4>お届け先 #{destination.id}</h4>
        {destination.id !== 1 && (
          <button 
            type="button" 
            className="remove-destination-btn"
            onClick={() => onRemoveDestination(destination.id)}
          >
            <i className="fas fa-times"></i> 削除
          </button>
        )}
      </div>
      
      <div className="destination-form">
        <div className="form-group name-group">
          <label htmlFor={`name-${destination.id}`}>お名前</label>
          <div className="name-input-container">
            <input 
              type="text" 
              id={`name-${destination.id}`} 
              name={`name-${destination.id}`}
              value={destination.name}
              onChange={(e) => onAddressChange(destination.id, 'name', e.target.value)}
              required 
            />
            <span className="name-suffix">様</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor={`postal-${destination.id}`}>郵便番号</label>
          <input 
            type="text" 
            id={`postal-${destination.id}`} 
            name={`postal-${destination.id}`}
            value={destination.postalCode}
            onChange={(e) => {
              const value = e.target.value;
              onAddressChange(destination.id, 'postalCode', value);
            }}
            placeholder="例: 123-4567"
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`city-${destination.id}`}>都道府県</label>
          <input 
            type="text" 
            id={`city-${destination.id}`} 
            name={`city-${destination.id}`}
            value={destination.city}
            onChange={(e) => onAddressChange(destination.id, 'city', e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`address-${destination.id}`}>住所</label>
          <input 
            type="text" 
            id={`address-${destination.id}`} 
            name={`address-${destination.id}`}
            value={destination.address}
            onChange={(e) => onAddressChange(destination.id, 'address', e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`phone-${destination.id}`}>電話番号</label>
          <input 
            type="tel" 
            id={`phone-${destination.id}`} 
            name={`phone-${destination.id}`}
            value={destination.phone}
            onChange={(e) => onAddressChange(destination.id, 'phone', e.target.value)}
            required 
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
