import express from "express";

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";

import upload from "../middleware/uploadMiddleware.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  Admin: get all products,
  including inactive products.
*/
router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminProducts
);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    adminOnly,
    upload.single("image"),
    createProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(
    protect,
    adminOnly,
    upload.single("image"),
    updateProduct
  )
  .delete(
    protect,
    adminOnly,
    deleteProduct
  );

export default router;