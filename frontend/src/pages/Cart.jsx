import {
  ArrowLeft,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import "./css/Cart.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function Cart() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const deliveryFee = cartTotal >= 50 ? 0 : 3;
  const finalTotal = cartTotal + deliveryFee;
  const remainingForFreeDelivery = Math.max(
    0,
    50 - cartTotal
  );

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (product) => {
  const image =
    product.images?.[0]?.url ||
    product.image ||
    "";

  if (!image) {
    return "https://placehold.co/700x700/17120d/f5b522?text=BeePositive";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SERVER_URL}${image}`;
  }

  return `${SERVER_URL}/${image}`;
};

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-background-glow cart-glow-one" />
        <div className="cart-background-glow cart-glow-two" />

        <section className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={46} />
          </div>

          <span className="empty-cart-label">
            Your BeePositive Basket
          </span>

          <h1>Your cart is waiting for something sweet.</h1>

          <p>
            Explore our carefully selected honey and
            beekeeping products and add your favorites
            to the basket.
          </p>

          <Link
            to="/products"
            className="continue-shopping-button"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-background-glow cart-glow-one" />
      <div className="cart-background-glow cart-glow-two" />

      <section className="cart-container">
        <div className="cart-heading">
          <div>
            <div className="cart-eyebrow">
              <Sparkles size={15} />
              BeePositive Store
            </div>

            <h1>Your Shopping Cart</h1>

            <p>
              You have {cartCount}{" "}
              {cartCount === 1 ? "item" : "items"} ready
              for checkout.
            </p>
          </div>

          <button
            type="button"
            className="clear-cart-button"
            onClick={clearCart}
          >
            <Trash2 size={17} />
            Clear Cart
          </button>
        </div>

        {remainingForFreeDelivery > 0 ? (
          <div className="free-delivery-banner">
            <Truck size={20} />

            <div>
              <strong>
                Add ${remainingForFreeDelivery.toFixed(2)} more
                for free delivery.
              </strong>

              <p>
                Orders over $50 receive complimentary
                delivery.
              </p>
            </div>
          </div>
        ) : (
          <div className="free-delivery-banner is-unlocked">
            <Truck size={20} />

            <div>
              <strong>You unlocked free delivery.</strong>

              <p>
                Your BeePositive order qualifies for
                complimentary delivery.
              </p>
            </div>
          </div>
        )}

        <div className="cart-layout">
          <section className="cart-items">
            {cartItems.map((item) => {
              const itemTotal =
                Number(item.price) *
                Number(item.quantity);

              const stockAvailable =
                item.stock === undefined ||
                Number(item.quantity) <
                  Number(item.stock);

              return (
                <article
                  className="cart-item"
                  key={item._id}
                >
                  <div className="cart-item-image-wrapper">
                    <div className="cart-item-image-glow" />

                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>

                  <div className="cart-item-information">
                    <div className="cart-item-top">
                      <div>
                        <div className="cart-item-meta">
                          <span className="cart-item-category">
                            {item.category ||
                              "BeePositive"}
                          </span>

                          {item.weight && (
                            <span className="cart-item-weight">
                              {item.weight}{" "}
                              {item.weightUnit}
                            </span>
                          )}
                        </div>

                        <h2>{item.name}</h2>

                        <p className="cart-item-description">
                          {item.description ||
                            "A carefully selected BeePositive product inspired by the natural quality of the hive."}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() =>
                          removeFromCart(item._id)
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="quantity-section">
                        <span>Quantity</span>

                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item._id
                              )
                            }
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={16} />
                          </button>

                          <strong>
                            {item.quantity}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item._id
                              )
                            }
                            disabled={!stockAvailable}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-price">
                        <span>
                          ${Number(item.price).toFixed(2)} each
                        </span>

                        <strong>
                          ${itemTotal.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <Link
              to="/products"
              className="cart-continue-shopping"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </section>

          <aside className="order-summary">
            <div className="summary-heading">
              <span className="summary-label">
                Order Summary
              </span>

              <h2>Ready to checkout?</h2>

              <p>
                Review your order before entering your
                delivery information.
              </p>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>
                  Items ({cartCount})
                </span>

                <strong>
                  ${cartTotal.toFixed(2)}
                </strong>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <strong>
                  {deliveryFee === 0
                    ? "Free"
                    : `$${deliveryFee.toFixed(2)}`}
                </strong>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <div>
                <span>Total</span>
                <small>USD</small>
              </div>

              <strong>
                ${finalTotal.toFixed(2)}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Proceed to Checkout
              <LockKeyhole size={18} />
            </Link>

            <div className="summary-security">
              <ShieldCheck size={18} />

              <span>
                Secure checkout and protected order
                details
              </span>
            </div>

            <div className="summary-benefits">
              <div>
                <Truck size={18} />

                <span>
                  Free delivery over $50
                </span>
              </div>

              <div>
                <ShieldCheck size={18} />

                <span>
                  Carefully packed products
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Cart;