import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [initialStock, setInitialStock] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.products.create({
        name, sku, category, unit, stock_quantity: parseFloat(initialStock) || 0
      });
      setShowModal(false);
      setName(''); setSku(''); setCategory(''); setInitialStock(0);
      fetchProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Products List</h2>
        <button onClick={() => setShowModal(true)} style={{ width: 'auto' }}>+ Add Product</button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No products found. Add one to get started.</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.unit}</td>
                <td style={{ fontWeight: 'bold', color: p.stock_quantity <= 10 ? 'var(--danger)' : 'var(--text-main)' }}>
                  {p.stock_quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem', color: 'var(--primary-color)' }}>New Product</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Product Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>SKU / Code</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Unit of Measure</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)}>
                    <option>Pieces</option>
                    <option>KG</option>
                    <option>Liters</option>
                    <option>Boxes</option>
                    <option>Meters</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Initial Stock</label>
                  <input type="number" min="0" step="0.01" value={initialStock} onChange={e => setInitialStock(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit">Save Product</button>
                <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
