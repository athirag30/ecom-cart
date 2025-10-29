# 🛍️ Vibe Commerce - Full Stack E-Commerce Cart

A complete full-stack shopping cart application built with React, Node.js, Express, and MongoDB. Features product catalog, cart management, and mock checkout process.


## 🚀 Features

- **🛒 Product Catalog** - Browse products with images, prices, and descriptions
- **📦 Shopping Cart** - Add, remove, and update item quantities with real-time totals
- **💳 Checkout Process** - Complete order flow with customer form and receipt generation
- **📱 Responsive Design** - Mobile-first design that works on all devices
- **🎯 Real-time Updates** - Live cart updates with toast notifications
- **🔐 Session Management** - Persistent cart using session-based users
- **🎨 Modern UI** - Beautiful gradient designs and smooth animations

## 🖼️ Application Screenshots

### Product Catalog
![Product Grid](screenshots/image.png)
![Product Grid2](screenshots/img2.png)
*Browse through available products with "Add to Cart" functionality and responsive grid layout*

### Shopping Cart Management
![Shopping Cart add](screenshots/img3.png)  
![Shopping Cart add](screenshots/img4.png)  
![Shopping Cart remove](screenshots/img5.png)  
![Shopping Cart remove](screenshots/img6.png)  
*Manage cart items with quantity controls, remove items, and see real-time total calculation*

### Checkout Process
![Checkout Form](screenshots/img7.png)
*Simple and clean checkout form collecting customer information*

### Order Confirmation
![Order Receipt](screenshots/img9.png)
*Order confirmation with detailed receipt including order ID and itemized breakdown*

### Error handling
![error handling](screenshots/img8.png)
*Fully responsive design that adapts to mobile devices with optimized layouts*

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Axios** - HTTP client for API calls
- **CSS3** - Modern layouts with Flexbox and Grid
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js & Express** - Server framework and API routes
- **MongoDB with Mongoose** - Database and ODM
- **RESTful API** - Clean API design with proper HTTP methods
- **CORS** - Cross-origin resource sharing enabled

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecom-cart.git
cd ecom-cart
2. Backend Setup
bash
cd backend
npm install

# Create environment file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/ecom-cart" >> .env

# Start the backend server
npm start
Server runs on http://localhost:5000

3. Frontend Setup
bash
cd frontend
npm install

# Start the React development server
npm start
Application opens at http://localhost:3000

4. Verify Setup
Frontend: http://localhost:3000

Backend API: http://localhost:5000

Health Check: http://localhost:5000/api/health

🗂️ Project Structure
text
ecom-cart/
├── backend/
│   ├── server.js          # Express server with API routes
│   ├── package.json       # Backend dependencies and scripts
│   ├── .env              # Environment variables
│   └── .gitignore        # Git ignore rules
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling and responsive design
│   │   └── index.js      # React DOM entry point
│   ├── public/
│   │   └── index.html    # HTML template
│   ├── package.json      # Frontend dependencies
│   └── .gitignore        # Git ignore rules
├── screenshots/          # Application screenshots
│   ├── products.png      # Product catalog view
│   ├── cart.png          # Shopping cart view
│   ├── checkout.png      # Checkout form
│   ├── receipt.png       # Order confirmation
│   └── mobile.png        # Mobile responsive view
└── README.md            # Project documentation
📡 API Endpoints
Method	Endpoint	Description	Example Response
GET	/api/products	Fetch all products	[{id, name, price, image, description}]
GET	/api/cart	Get cart items with total	{items: [], total: 0}
POST	/api/cart	Add item to cart	{productId, quantity}
PUT	/api/cart/:id	Update item quantity	{quantity: 2}
DELETE	/api/cart/:id	Remove item from cart	{message: "Item removed"}
POST	/api/checkout	Process order checkout	{orderId, customer, items, total}
GET	/api/health	API health check	{status: "OK", database: "Connected"}
 Features Demonstration
 Full-Stack Architecture
Separated frontend and backend with clear API contracts

Independent development and deployment capabilities

Database Integration
MongoDB with Mongoose ODM

Product and cart data persistence

Proper data modeling with relationships

User Experience
Toast notifications for user actions

Loading states during API calls

Responsive design for all screen sizes

Real-time cart updates

Error Handling
API error boundaries

Network request error handling

Input validation on forms

Graceful fallbacks for images

Code Quality
Modular component structure

Clean separation of concerns

Consistent code formatting

Comprehensive documentation

🎥 Demo Video
https://www.loom.com/share/ef510bad4e3d4aa7b6d13f669ab86f06

Demo video showcasing:

Product browsing and adding to cart

Cart management and quantity updates

Checkout process and form validation

Order confirmation and receipt



Deployment Guide
Backend Deployment (Heroku/Railway)
bash
# Set environment variables
MONGODB_URI=your_mongodb_connection_string
PORT=5000
Frontend Deployment (Netlify/Vercel)
bash
# Build command
npm run build



Author
Athira George

GitHub: @athirag30

Portfolio: https://github.com/athirag30/ecom-cart

