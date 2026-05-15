import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import AdminRoute from './components/Admin/AdminRoute';
import AdminUsers from './pages/AdminUsers';
import UpdateProfile from './pages/UpdateProfile';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/Common/ProtectedRoute'; 
import AccountSettings from './pages/AccountSettings';
import Cart from './pages/Cart'; 
import MyOrders from './pages/MyOrders';
import AdminOrders from './pages/AdminOrders';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import OrderDetails from './pages/OrderDetails';
import PaymentInstructions from './pages/PaymentInstructions';

// Import Providers
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    /* 1. Wrap the app in OrderProvider so MyOrders can access 'orders' */
    <OrderProvider>
      {/* 2. Wrap in CartProvider so Cart functions work */}
      <CartProvider>
        <Navbar /> 
        <div className="container mx-auto"> 
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} /> 
            <Route path="/payment-instructions" element={<PaymentInstructions />} />
            
            {/* Regular User Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/order-details/:id" element={<OrderDetails />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/change-password" element={<ChangePassword />} />  
            </Route>

            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </div>
      </CartProvider>
    </OrderProvider>
  );
}

export default App;