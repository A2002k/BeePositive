import fs from "fs/promises";
import path from "path";

import Product from "../models/Product.js";

const createSlug = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
};

const removeUploadedFile = async (file) => {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.error(
      "Unable to remove uploaded file:",
      error.message
    );
  }
};

/*
  GET /api/products

  Supported queries:
  ?bestSeller=true
  ?featured=true
  ?active=true
*/
export const getProducts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.bestSeller !== undefined) {
      filter.isBestSeller = parseBoolean(
        req.query.bestSeller
      );
    }

    if (req.query.featured !== undefined) {
      filter.isFeatured = parseBoolean(
        req.query.featured
      );
    }

    if (req.query.active !== undefined) {
      filter.isActive = parseBoolean(
        req.query.active
      );
    } else {
      filter.isActive = true;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/*
  GET /api/products/admin

  Admin: return all products, including inactive ones.
*/
export const getAdminProducts = async (
  req,
  res,
  next
) => {
  try {
    const products = await Product.find({}).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/*
  GET /api/products/:id
*/
export const getProductById = async (
  req,
  res,
  next
) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      res.status(404);

      throw new Error("Product not found");
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/*
  POST /api/products

  Must be sent as multipart/form-data.

  Image field name:
  image
*/
export const createProduct = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      price,
      weight,
      weightUnit,
      stock,
      isBestSeller,
      isFeatured,
      isOrganic,
      isActive,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      price === undefined
    ) {
      await removeUploadedFile(req.file);

      res.status(400);

      throw new Error(
        "Name, description, category and price are required."
      );
    }

    if (!req.file) {
      res.status(400);

      throw new Error(
        "A product image is required."
      );
    }

    const generatedSlug =
      createSlug(slug || name);

    const existingProduct =
      await Product.findOne({
        slug: generatedSlug,
      });

    if (existingProduct) {
      await removeUploadedFile(req.file);

      res.status(409);

      throw new Error(
        "A product with this slug already exists."
      );
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const product = await Product.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      weight:
        weight !== undefined && weight !== ""
          ? Number(weight)
          : null,
      weightUnit: weightUnit || "g",
      stock:
        stock !== undefined && stock !== ""
          ? Number(stock)
          : 0,

      images: [
        {
          url: imageUrl,
          alt: name.trim(),
        },
      ],

      isBestSeller: parseBoolean(isBestSeller),
      isFeatured: parseBoolean(isFeatured),
      isOrganic: parseBoolean(isOrganic),
      isActive: parseBoolean(isActive, true),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/*
  PUT /api/products/:id

  A new image is optional.
*/
export const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      await removeUploadedFile(req.file);

      res.status(404);

      throw new Error("Product not found");
    }

    const {
      name,
      slug,
      description,
      category,
      price,
      weight,
      weightUnit,
      stock,
      isBestSeller,
      isFeatured,
      isOrganic,
      isActive,
    } = req.body;

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (slug !== undefined || name !== undefined) {
      const nextSlug = createSlug(
        slug || name || product.name
      );

      const existingProduct =
        await Product.findOne({
          slug: nextSlug,
          _id: {
            $ne: product._id,
          },
        });

      if (existingProduct) {
        await removeUploadedFile(req.file);

        res.status(409);

        throw new Error(
          "A product with this slug already exists."
        );
      }

      product.slug = nextSlug;
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (weight !== undefined) {
      product.weight =
        weight === "" ? null : Number(weight);
    }

    if (weightUnit !== undefined) {
      product.weightUnit = weightUnit;
    }

    if (stock !== undefined) {
      product.stock = Number(stock);
    }

    if (isBestSeller !== undefined) {
      product.isBestSeller =
        parseBoolean(isBestSeller);
    }

    if (isFeatured !== undefined) {
      product.isFeatured =
        parseBoolean(isFeatured);
    }

    if (isOrganic !== undefined) {
      product.isOrganic =
        parseBoolean(isOrganic);
    }

    if (isActive !== undefined) {
      product.isActive = parseBoolean(isActive);
    }

    if (req.file) {
      product.images = [
        {
          url: `/uploads/${req.file.filename}`,
          alt: name?.trim() || product.name,
        },
      ];
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/*
  DELETE /api/products/:id
*/
export const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      res.status(404);

      throw new Error("Product not found");
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};