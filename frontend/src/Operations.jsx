import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function Operations() {
  const [activeTab, setActiveTab] = useState('receipt'); // receipt | delivery
  const [products, setProducts] = useState([]);
  const [partner, setPartner] = useState(''); // supplier or customer
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.products.getAll().then(setProducts).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert('Select a product');
    setMessage(null);

    const payload = {
      status: 'Done', // auto-validate for simplicity in demo
      items: [{ product_id: parseInt(selectedProduct), quantity: parseFloat(quantity) }]
    };

    try {
      if (activeTab === 'receipt') {
        payload.supplier = partner;
        await api.inventory.createReceipt(payload);
        setMessage(`Successfully received ${quantity} units from ${partner}`);
      } else {
        payload.customer = partner;
        await api.inventory.createDelivery(payload);
        setMessage(`Successfully delivered ${quantity} units to ${partner}`);
      }
      setPartner(''); setSelectedProduct(''); setQuantity(1);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Inventory Operations</h2>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          className={activeTab === 'receipt' ? '' : 'secondary'} 
          onClick={() => { setActiveTab('receipt'); setMessage(null); setPartner(''); }}
          style={{ width: 'auto' }}>
          ⬇️ Receive Goods (Receipt)
        </button>
        <button 
          className={activeTab === 'delivery' ? '' : 'secondary'} 
          onClick={() => { setActiveTab('delivery'); setMessage(null); setPartner(''); }}
          style={{ width: 'auto' }}>
          ⬆️ Ship Goods (Delivery)
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>
          {activeTab === 'receipt' ? 'New Incoming Receipt' : 'New Outgoing Delivery Order'}
        </h3>
        
        {message && <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: '8px', border: '1px solid var(--accent)' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label>{activeTab === 'receipt' ? 'Supplier Name' : 'Customer Name'}</label>
            <input type="text" value={partner} onChange={e => setPartner(e.target.value)} required placeholder="e.g. Acme Corp" />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ flex: 2 }}>
              <label>Select Product</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required>
                <option value="" disabled>Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock_quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label>Quantity</label>
              <input type="number" min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
          </div>

          <button type="submit" style={{ marginTop: '16px' }}>
            {activeTab === 'receipt' ? 'Validate Receipt' : 'Validate Delivery'}
          </button>
        </form>
      </div>
    </div>
  );
}
