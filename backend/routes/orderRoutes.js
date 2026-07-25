import express from "express";

import {
  createOrder,
  getAdminOrders,
  getMyOrderById,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  adminOnly,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order
router.post(
  "/",
  protect,
  createOrder
);

// Get logged-in user's orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// Get one logged-in user's order
router.get(
  "/my-orders/:id",
  protect,
  getMyOrderById
);

// Get all orders for admin
router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminOrders
);

// Update order status
router.patch(
  "/:orderId/status",
  protect,
  adminOnly,
  updateOrderStatus
);

export default router;