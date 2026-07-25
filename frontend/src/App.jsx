import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";
import { socket } from "./socket";

import Hero from "./components/Hero";
import HomeContent from "./components/HomeContent";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToHash from "./components/ScrollToHash";

import AdminLayout from "./components/admin/AdminLayout";
import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";


import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

function Home() {
  return (
    <>
      <Hero />
      <HomeContent />
    </>
  );
}

function App() {
  const location = useLocation();

useEffect(() => {
  const handleConnect = () => {
    console.log("Socket connected:", socket.id);
  };

  const handleDisconnect = (reason) => {
    console.log("Socket disconnected:", reason);
  };

  const handleConnectError = (error) => {
    console.error(
      "Socket connection error:",
      error.message
    );
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);

  if (!socket.connected) {
    socket.connect();
  }

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off(
      "connect_error",
      handleConnectError
    );

    
  };
}, []);

  const isAdminPage =
    location.pathname.startsWith("/admin");



  return (
    <main className="min-h-screen bg-[#0b0907]">
      <ScrollToHash />

      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

     <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route
    path="dashboard"
    element={<AdminDashboard />}
  />

  <Route
    path="orders"
    element={<AdminOrders />}
  />

  <Route
    path="products"
    element={<AdminProducts />}
  />

  <Route
    path="customers"
    element={<AdminCustomers />}
  />
</Route>

      </Routes>
    </main>
  );
}

export default App;