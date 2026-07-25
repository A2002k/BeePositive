import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./css/Checkout.css";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="300"
      height="300"
      viewBox="0 0 300 300"
    >
      <rect
        width="300"
        height="300"
        fill="#f7eed8"
      />

      <circle
        cx="150"
        cy="115"
        r="45"
        fill="#f3b322"
      />

      <path
        d="M128 115h44M150 93v44"
        stroke="#4b3510"
        stroke-width="8"
        stroke-linecap="round"
      />

      <text
        x="50%"
        y="205"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="22"
        font-weight="700"
        fill="#4b3510"
      >
        BeePositive
      </text>
    </svg>
  `);

function getProductImage(item) {
  const firstImage = item?.images?.[0];

  const imagePath =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url ||
        firstImage?.imageUrl ||
        firstImage?.secure_url ||
        item?.image ||
        item?.imageUrl ||
        item?.thumbnail ||
        "";

  if (!imagePath) {
    return FALLBACK_IMAGE;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${SERVER_URL}${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `${SERVER_URL}/${imagePath}`;
  }

  return imagePath;
}

function Checkout() {
  const navigate = useNavigate();

  const { token, user } = useAuth();

  const {
    cartItems,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [orderSuccess, setOrderSuccess] =
    useState(null);

  const deliveryFee = cartTotal >= 50 ? 0 : 3;

  const finalTotal = cartTotal + deliveryFee;

  useEffect(() => {
    setFormData((currentData) => ({
      ...currentData,

      customerName:
        currentData.customerName ||
        user?.name ||
        "",

      email:
        currentData.email ||
        user?.email ||
        "",

      phone:
        currentData.phone ||
        user?.phone ||
        "",
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      return "Please enter your city or area.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!token) {
      setError(
        "Please log in before placing your order."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const orderItems = cartItems.map((item) => ({
        product: item._id,
        quantity: Number(item.quantity),
      }));

      const orderData = {
        customer: {
          name: formData.customerName.trim(),

          email: formData.email
            .trim()
            .toLowerCase(),

          phone: formData.phone.trim(),

          address: formData.address.trim(),

          city: formData.city.trim(),

          notes: formData.notes.trim(),
        },

        items: orderItems,

        paymentMethod: "Cash on Delivery",

        deliveryFee,
      };

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place your order."
        );
      }

      setOrderSuccess({
        orderNumber:
          data.order?.orderNumber ||
          data.order?._id,

        total:
          data.order?.total ?? finalTotal,
      });

      clearCart();
    } catch (requestError) {
      console.error(
        "Checkout error:",
        requestError
      );

      setError(
        requestError.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <ShoppingBag size={45} />

          <h1>Your cart is empty</h1>

          <p>
            Add a product before continuing to
            checkout.
          </p>

          <Link
            to="/products"
            className="checkout-products-link"
          >
            Browse Products
          </Link>
        </section>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="checkout-page">
        <section className="order-success">
          <div className="order-success-icon">
            <CheckCircle2 size={50} />
          </div>

          <span className="success-label">
            Order Confirmed
          </span>

          <h1>Thank you for your order!</h1>

          <p>
            Your BeePositive order has been received
            and will be prepared for delivery.
          </p>

          {orderSuccess.orderNumber && (
            <div className="order-number">
              <span>Order number</span>

              <strong>
                {orderSuccess.orderNumber}
              </strong>
            </div>
          )}

          <div className="order-success-total">
            <span>Total</span>

            <strong>
              $
              {Number(
                orderSuccess.total
              ).toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            className="return-home-button"
            onClick={() =>
              navigate("/my-orders")
            }
          >
            View My Orders
          </button>

          <Link
            to="/"
            className="back-to-cart-link"
          >
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-container">
        <div className="checkout-heading">
          <span>Secure Checkout</span>

          <h1>Complete Your Order</h1>

          <p>
            Enter your delivery information to place
            your BeePositive order.
          </p>
        </div>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <div className="checkout-section">
              <div className="checkout-section-heading">
                <span>01</span>

                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Tell us how we can contact you.
                  </p>
                </div>
              </div>

              <div className="checkout-fields">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="customerName">
                    Full name
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={
                      formData.customerName
                    }
                    onChange={handleChange}
                    placeholder="Anthony Karam"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+961 70 123 456"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <div className="checkout-section-heading">
                <span>02</span>

                <div>
                  <h2>
                    Delivery Information
                  </h2>

                  <p>
                    Where should we deliver your
                    order?
                  </p>
                </div>
              </div>

              <div className="checkout-fields">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="address">
                    Delivery address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, building and floor"
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="city">
                    City or area
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Beirut, Achrafieh..."
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="notes">
                    Delivery notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Building details, preferred delivery time..."
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <div className="checkout-section-heading">
                <span>03</span>

                <div>
                  <h2>Payment</h2>

                  <p>
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={
                    formData.paymentMethod ===
                    "cash_on_delivery"
                  }
                  onChange={handleChange}
                />

                <span>
                  <strong>
                    Cash on delivery
                  </strong>

                  <small>
                    Pay when your BeePositive order
                    arrives.
                  </small>
                </span>
              </label>
            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="place-order-button"
              disabled={submitting}
            >
              {submitting
                ? "Placing Order..."
                : `Place Order — $${finalTotal.toFixed(
                    2
                  )}`}
            </button>

            <Link
              to="/cart"
              className="back-to-cart-link"
            >
              <ArrowLeft size={17} />
              Return to Cart
            </Link>
          </form>

          <aside className="checkout-summary">
            <span className="checkout-summary-label">
              Your Order
            </span>

            <h2>Order Summary</h2>

            <div className="checkout-summary-items">
              {cartItems.map((item) => {
                const imageUrl =
                  getProductImage(item);

                return (
                  <article
                    className="checkout-summary-item"
                    key={item._id}
                  >
                    <div className="checkout-summary-image">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />

                      <span>
                        {item.quantity}
                      </span>
                    </div>

                    <div className="checkout-summary-product">
                      <h3>{item.name}</h3>

                      {item.weight && (
                        <p>
                          {item.weight}{" "}
                          {item.weightUnit}
                        </p>
                      )}

                      <small>
                        $
                        {Number(
                          item.price || 0
                        ).toFixed(2)}{" "}
                        each
                      </small>
                    </div>

                    <strong>
                      $
                      {(
                        Number(item.price || 0) *
                        Number(
                          item.quantity || 0
                        )
                      ).toFixed(2)}
                    </strong>
                  </article>
                );
              })}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Subtotal ({cartCount}{" "}
                {cartCount === 1
                  ? "item"
                  : "items"}
                )
              </span>

              <strong>
                ${cartTotal.toFixed(2)}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>Delivery</span>

              <strong>
                {deliveryFee === 0
                  ? "Free"
                  : `$${deliveryFee.toFixed(
                      2
                    )}`}
              </strong>
            </div>

            {deliveryFee === 0 && (
              <p className="free-delivery-message">
                You received free delivery.
              </p>
            )}

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>Total</span>

              <strong>
                ${finalTotal.toFixed(2)}
              </strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Checkout;