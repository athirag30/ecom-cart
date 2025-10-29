import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with interceptors to handle session
const api = axios.create({
  baseURL: API_BASE,
});

// Add session ID to all requests
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['session-id'] = sessionId;
  }
  return config;
});

// Store session ID from responses
api.interceptors.response.use((response) => {
  const sessionId = response.headers['x-session-id'];
  if (sessionId && !localStorage.getItem('sessionId')) {
    localStorage.setItem('sessionId', sessionId);
  }
  return response;
});

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // Show notification function
  const showToast = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products');
    }
  };

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
      // Update session ID if we got a new one
      if (response.data.sessionId && response.data.sessionId !== sessionId) {
        setSessionId(response.data.sessionId);
        localStorage.setItem('sessionId', response.data.sessionId);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, productName) => {
    try {
      setLoading(true);
      await api.post('/cart', { productId, quantity: 1 });
      await fetchCart();
      showToast(`✅ ${productName} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('❌ Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId, productName) => {
    try {
      setLoading(true);
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      showToast(`🗑️ ${productName} removed from cart`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      showToast('❌ Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity, productName) => {
    try {
      if (newQuantity === 0) {
        await removeFromCart(itemId, productName);
        return;
      }
      setLoading(true);
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      await fetchCart();
      if (newQuantity > 1) {
        showToast(`📦 ${productName} quantity updated`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('❌ Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (customerData) => {
    try {
      setLoading(true);
      const response = await api.post('/checkout', customerData);
      setReceipt(response.data);
      setShowCheckout(false);
      await fetchCart();
      showToast('🎉 Order placed successfully!');
    } catch (error) {
      console.error('Error during checkout:', error);
      showToast('❌ Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('sessionId');
    setSessionId(null);
    fetchCart(); // This will create a new session
    showToast('🔄 New session started');
  };

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="App">
      {/* Toast Notification */}
      <ToastNotification 
        show={notification.show} 
        message={notification.message} 
      />
      
      <header className="app-header">
        <h1>Vibe Commerce</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {sessionId && (
            <button 
              onClick={clearSession}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
              title="Start new session"
            >
              New Session
            </button>
          )}
          <button 
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cartItemCount})
          </button>
        </div>
      </header>

      <main>
        {!showCart ? (
          <ProductGrid 
            products={products} 
            onAddToCart={addToCart}
            loading={loading}
          />
        ) : (
          <CartView
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onCheckout={() => setShowCheckout(true)}
            onClose={() => setShowCart(false)}
            loading={loading}
          />
        )}
      </main>

      {showCheckout && (
        <CheckoutForm
          onSubmit={handleCheckout}
          onCancel={() => setShowCheckout(false)}
          loading={loading}
        />
      )}

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}

// Toast Notification Component
function ToastNotification({ show, message }) {
  if (!show) return null;

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <span>{message}</span>
      </div>
    </div>
  );
}

function ProductGrid({ products, onAddToCart, loading }) {
  // Fallback image in case the URL fails
  const fallbackImage = "https://images.unsplash.com/photo-1560769684-5507c55e44c0?w=300&h=300&fit=crop";
  
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  return (
    <div className="product-grid">
      <h2>Our Products</h2>
      <div className="products">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img 
              src={product.image} 
              alt={product.name}
              onError={handleImageError}
            />
            <h3>{product.name}</h3>
            <p className="price">${product.price}</p>
            <p className="description">{product.description}</p>
            <div className="product-rating">
              ⭐ {product.rating?.rate || '4.5'} ({product.rating?.count || '100'})
            </div>
            <button 
              onClick={() => onAddToCart(product._id, product.name)}
              disabled={loading}
              className="add-to-cart-btn"
            >
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartView({ cart, onUpdateQuantity, onRemoveFromCart, onCheckout, onClose, loading }) {
  return (
    <div className="cart-view">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button onClick={onClose}>← Continue Shopping</button>
      </div>
      
      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <small>Add some products to get started!</small>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.productId.image} alt={item.productId.name} />
                <div className="item-details">
                  <h4>{item.productId.name}</h4>
                  <p>${item.productId.price}</p>
                </div>
                <div className="quantity-controls">
                  <button 
                    onClick={() => onUpdateQuantity(item._id, item.quantity - 1, item.productId.name)}
                    disabled={loading || item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item._id, item.quantity + 1, item.productId.name)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  ${(item.productId.price * item.quantity).toFixed(2)}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveFromCart(item._id, item.productId.name)}
                  disabled={loading}
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-details">
              <p>Subtotal: <span>${cart.total.toFixed(2)}</span></p>
              <p>Tax (8%): <span>${(cart.total * 0.08).toFixed(2)}</span></p>
              <h3>Total: <span>${((cart.total * 1.08)).toFixed(2)}</span></h3>
            </div>
            <button 
              className="checkout-btn"
              onClick={onCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CheckoutForm({ onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    address: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Shipping Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your shipping address"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal receipt">
        <h2>Order Confirmed! 🎉</h2>
        <div className="receipt-details">
          <p><strong>Order ID:</strong> {receipt.orderId}</p>
          <p><strong>Customer:</strong> {receipt.customer.name}</p>
          <p><strong>Email:</strong> {receipt.customer.email}</p>
          <p><strong>Address:</strong> {receipt.customer.address}</p>
          <p><strong>Date:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
          
          <h3>Order Items:</h3>
          {receipt.items.map((item, index) => (
            <div key={index} className="receipt-item">
              <span>{item.product} x {item.quantity}</span>
              <span>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          
          <div className="receipt-total">
            <div>
              <span>Subtotal:</span>
              <span>${receipt.total.toFixed(2)}</span>
            </div>
            <div>
              <span>Tax:</span>
              <span>${receipt.tax.toFixed(2)}</span>
            </div>
            <div className="grand-total">
              <strong>Total:</strong>
              <strong>${receipt.grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="close-btn">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default App;