import express from "express";

import {
  getAdminCustomers,
} from "../controllers/userController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin/customers",
  protect,
  adminOnly,
  getAdminCustomers
);

export default router;