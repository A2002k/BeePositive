import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

import {
  sendOrderConfirmationEmail,
} from "../utils/sendOrderEmail.js";

function createOrderNumber(orderId) {
  const shortId = orderId
    .toString()
    .slice(-8)
    .toUpperCase();

  return `BP-${shortId}`;
}

function formatOrder(order) {
  const formattedOrder =
    typeof order.toObject === "function"
      ? order.toObject()
      : order;

  return formattedOrder;
}

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createOrder(req, res) {
  const session = await mongoose.startSession();

  try {
    const {
      customer,
      items,
      paymentMethod = "Cash on Delivery",
      deliveryFee = 0,
    } = req.body;

    if (!req.user?._id) {
      throw new HttpError(
        401,
        "You must be logged in to place an order."
      );
    }

    if (!customer) {
      throw new HttpError(
        400,
        "Customer delivery information is required."
      );
    }

    const requiredCustomerFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
    ];

    const missingField =
      requiredCustomerFields.find((field) => {
        return (
          typeof customer[field] !== "string" ||
          !customer[field].trim()
        );
      });

    if (missingField) {
      throw new HttpError(
        400,
        `${missingField} is required.`
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new HttpError(
        400,
        "Your cart must contain at least one product."
      );
    }

    /*
      Merge duplicate product rows.

      Example:
      Product A quantity 1
      Product A quantity 2

      Becomes:
      Product A quantity 3
    */
    const requestedProducts = new Map();

    for (const item of items) {
      const productId =
        item.product ||
        item._id ||
        item.productId;

      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        throw new HttpError(
          400,
          "One of the products has an invalid ID."
        );
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new HttpError(
          400,
          "Product quantity must be at least 1."
        );
      }

      const normalizedProductId =
        productId.toString();

      const previousQuantity =
        requestedProducts.get(
          normalizedProductId
        ) || 0;

      requestedProducts.set(
        normalizedProductId,
        previousQuantity + quantity
      );
    }

    const normalizedDeliveryFee =
      Number(deliveryFee);

    if (
      !Number.isFinite(
        normalizedDeliveryFee
      ) ||
      normalizedDeliveryFee < 0
    ) {
      throw new HttpError(
        400,
        "Delivery fee must be a valid positive number."
      );
    }

    let createdOrder;
    const updatedProductIds = [];

    await session.withTransaction(
      async () => {
        const preparedItems = [];
        let subtotal = 0;

        for (const [
          productId,
          quantity,
        ] of requestedProducts.entries()) {
          /*
            This checks stock and reduces it in
            one atomic MongoDB operation.

            stock must be greater than or equal
            to the requested quantity.
          */
          const product =
            await Product.findOneAndUpdate(
              {
                _id: productId,
                stock: {
                  $gte: quantity,
                },
              },
              {
                $inc: {
                  stock: -quantity,
                },
              },
              {
                new: true,
                session,
                runValidators: true,
              }
            );

          /*
            Product was not updated because:

            1. Product does not exist
            2. Product does not have enough stock
          */
          if (!product) {
            const existingProduct =
              await Product.findById(
                productId
              ).session(session);

            if (!existingProduct) {
              throw new HttpError(
                404,
                "One of the products no longer exists."
              );
            }

            const availableStock =
              Number(
                existingProduct.stock || 0
              );

            throw new HttpError(
              409,
              availableStock > 0
                ? `Only ${availableStock} ${existingProduct.name} available.`
                : `${existingProduct.name} is out of stock.`
            );
          }

          const price =
            Number(product.price);

          if (
            !Number.isFinite(price) ||
            price < 0
          ) {
            throw new HttpError(
              400,
              "One of the products has an invalid price."
            );
          }

          subtotal +=
            price * quantity;

          const firstImage =
            product.images?.[0];

          const image =
            typeof firstImage === "string"
              ? firstImage
              : firstImage?.url || "";

          preparedItems.push({
            product: product._id,
            name: product.name,
            image,
            price,
            quantity,
          });

          updatedProductIds.push(
            product._id
          );
        }

        const total =
          subtotal +
          normalizedDeliveryFee;

        const orderId =
          new mongoose.Types.ObjectId();

        const orderNumber =
          createOrderNumber(orderId);

        const orders =
          await Order.create(
            [
              {
                _id: orderId,

                orderNumber,

                user: req.user._id,

                customer: {
                  name:
                    customer.name.trim(),

                  email:
                    customer.email
                      .trim()
                      .toLowerCase(),

                  phone:
                    customer.phone.trim(),

                  address:
                    customer.address.trim(),

                  city:
                    customer.city.trim(),

                  notes:
                    typeof customer.notes ===
                    "string"
                      ? customer.notes.trim()
                      : "",
                },

                items: preparedItems,

                paymentMethod,

                subtotal,

                deliveryFee:
                  normalizedDeliveryFee,

                total,
              },
            ],
            {
              session,
            }
          );

        createdOrder = orders[0];
      }
    );

    /*
      Email is outside the transaction.

      An email failure should not undo a
      successfully created order.
    */
    let emailSent = false;

    try {
      await sendOrderConfirmationEmail({
        customer: {
          name:
            createdOrder.customer.name,

          email:
            createdOrder.customer.email,

          phone:
            createdOrder.customer.phone,

          address:
            createdOrder.customer.address,

          city:
            createdOrder.customer.city,
        },

        order: {
          _id: createdOrder._id,

          orderNumber:
            createdOrder.orderNumber,

          items:
            createdOrder.items.map(
              (item) => ({
                name: item.name,
                image: item.image,
                price: item.price,
                quantity:
                  item.quantity,
              })
            ),

          paymentMethod:
            createdOrder.paymentMethod,

          subtotal:
            createdOrder.subtotal,

          deliveryFee:
            createdOrder.deliveryFee,

          total:
            createdOrder.total,
        },
      });

      emailSent = true;

      console.log(
        `Order confirmation email sent to ${createdOrder.customer.email}`
      );
    } catch (emailError) {
      console.error(
        "Order created, but confirmation email failed:",
        emailError
      );
    }

    const io = req.app.get("io");

    if (io) {
      io.to("admins").emit(
        "new-order",
        {
          _id: createdOrder._id,

          orderNumber:
            createdOrder.orderNumber ||
            createdOrder._id
              .toString()
              .slice(-6)
              .toUpperCase(),

          customerName:
            createdOrder.customer
              ?.name || "Customer",

          total:
            createdOrder.total || 0,

          status:
            createdOrder.status ||
            "pending",

          createdAt:
            createdOrder.createdAt,
        }
      );

      /*
        We will connect the frontend
        to this event in Step 3.
      */
      io.emit("stock-updated", {
        productIds:
          updatedProductIds.map(
            (productId) =>
              productId.toString()
          ),

        updatedAt:
          new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,

      message: emailSent
        ? "Order created successfully. A confirmation email has been sent."
        : "Order created successfully, but the confirmation email could not be sent.",

      emailSent,

      order:
        formatOrder(createdOrder),
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    if (error instanceof HttpError) {
      return res
        .status(error.statusCode)
        .json({
          success: false,
          message: error.message,
        });
    }

    if (
      error?.code === 11000 &&
      error?.keyPattern?.orderNumber
    ) {
      return res.status(409).json({
        success: false,

        message:
          "An order-number conflict occurred. Please try placing the order again.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Unable to create your order.",
    });
  } finally {
    await session.endSession();
  }
}



export async function getMyOrders(
  req,
  res
) {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate(
        "items.product",
        "name price images"
      );

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(formatOrder),
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve your orders.",
    });
  }
}

export async function getMyOrderById(
  req,
  res
) {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).populate(
      "items.product",
      "name price images"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order: formatOrder(order),
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve this order.",
    });
  }
}

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve orders.",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(orderId)
        .session(session)
        .populate("user", "name email phone")
        .populate("items.product", "name price image");

      if (!order) {
        throw new HttpError(404, "Order not found.");
      }

      // Prevent reopening cancelled orders
      if (
        order.status === "cancelled" &&
        status !== "cancelled"
      ) {
        throw new HttpError(
          400,
          "Cancelled orders cannot be reopened."
        );
      }

      // Prevent cancelling delivered orders
      if (
        order.status === "delivered" &&
        status === "cancelled"
      ) {
        throw new HttpError(
          400,
          "Delivered orders cannot be cancelled."
        );
      }

      // Restore stock ONLY once
      if (
        status === "cancelled" &&
        order.status !== "cancelled"
      ) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product._id,
            {
              $inc: {
                stock: item.quantity,
              },
            },
            {
              session,
            }
          );
        }

        order.cancelledAt = new Date();
      }

      if (
        status === "delivered" &&
        !order.deliveredAt
      ) {
        order.deliveredAt = new Date();
      }

      order.status = status;

      await order.save({ session });

      updatedOrder = order;
    });

    const io = req.app.get("io");

    if (io) {
      io.to("admins").emit(
        "order-status-updated",
        updatedOrder
      );

      if (status === "cancelled") {
        io.emit("stock-updated", {
          productIds: updatedOrder.items.map((i) =>
            i.product._id.toString()
          ),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  } finally {
    await session.endSession();
  }
};