const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-cart';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
});

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  addedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Initialize sample products
const initializeProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    const sampleProducts = [
      {
        name: "Wireless Bluetooth Headphones",
        price: 79.99,
        description: "High-quality wireless headphones with noise cancellation",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        category: "Electronics"
      },
      {
        name: "Smart Fitness Watch",
        price: 199.99,
        description: "Track your fitness and health metrics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        category: "Electronics"
      },
      {
        name: "Organic Cotton T-Shirt",
        price: 29.99,
        description: "Comfortable and sustainable cotton t-shirt",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
        category: "Clothing"
      },
      {
        name: "Stainless Steel Water Bottle",
        price: 24.99,
        description: "Keep your drinks hot or cold for hours",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
        category: "Accessories"
      },
      {
        name: "Laptop Backpack",
        price: 59.99,
        description: "Durable backpack with laptop compartment",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
        category: "Accessories"
      },
      {
        name: "Ceramic Coffee Mug Set",
        price: 34.99,
        description: "Set of 4 beautiful ceramic mugs",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop",
        category: "Home"
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('Sample products added to database');
  }
};

// Routes

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/cart - Get cart items with total
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.find().populate('productId');
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);
    
    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let cartItem = await CartItem.findOne({ productId });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new CartItem({ productId, quantity });
      await cartItem.save();
    }
    
    await cartItem.populate('productId');
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await CartItem.findByIdAndDelete(id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// PUT /api/cart/:id - Update item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(id);
      return res.json({ message: 'Item removed from cart' });
    }
    
    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).populate('productId');
    
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// POST /api/checkout - Process checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const cartItems = await CartItem.find().populate('productId');
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);
    
    const receipt = {
      orderId: 'ORD-' + Date.now(),
      customer: { name, email },
      items: cartItems.map(item => ({
        product: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        subtotal: item.productId.price * item.quantity
      })),
      total: parseFloat(total.toFixed(2)),
      timestamp: new Date().toISOString()
    };
    
    await CartItem.deleteMany({});
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeProducts();
});