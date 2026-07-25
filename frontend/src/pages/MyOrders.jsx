import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  MapPin,
  Package,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./css/MyOrders.css";

const API_URL = "http://localhost:5000/api";

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-LB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status) {
  return status
    .toLowerCase()
    .replaceAll(" ", "-");
}

function MyOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load your orders."
          );
        }

        setOrders(data.orders || []);
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOrders();
    }
  }, [token]);

  const totalSpent = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      ),
    [orders]
  );

  const toggleOrder = (orderId) => {
    setExpandedOrder((currentOrderId) =>
      currentOrderId === orderId
        ? ""
        : orderId
    );
  };

  return (
    <main className="orders-page">
      <div className="orders-background-glow" />

      <section className="orders-container">
        <header className="orders-heading">
          <div>
            <span>Order History</span>

            <h1>My Orders</h1>

            <p>
              Follow your BeePositive purchases and
              delivery progress.
            </p>
          </div>

          {!loading && orders.length > 0 && (
            <div className="orders-summary">
              <div>
                <ShoppingBag size={21} />

                <span>
                  <small>Total orders</small>
                  <strong>{orders.length}</strong>
                </span>
              </div>

              <div>
                <ReceiptText size={21} />

                <span>
                  <small>Total spent</small>
                  <strong>
                    {formatPrice(totalSpent)}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <section className="orders-loading">
            <span className="orders-loader" />

            <h2>Loading your orders</h2>

            <p>
              Gathering your BeePositive purchases.
            </p>
          </section>
        )}

        {!loading && error && (
          <section className="orders-message-card">
            <PackageSearch size={44} />

            <h2>Unable to load orders</h2>

            <p>{error}</p>
          </section>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <section className="orders-empty">
              <div className="orders-empty-icon">
                <PackageSearch size={46} />
              </div>

              <h2>No orders yet</h2>

              <p>
                After you complete your first order, its
                products and delivery status will appear
                here.
              </p>

              <Link to="/products">
                <ArrowLeft size={18} />
                Browse Products
              </Link>
            </section>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <section className="orders-list">
              {orders.map((order, index) => {
                const isExpanded =
                  expandedOrder === order._id;

                return (
                  <article
                    className="order-card"
                    key={order._id}
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <button
                      type="button"
                      className="order-card-summary"
                      onClick={() =>
                        toggleOrder(order._id)
                      }
                    >
                      <span className="order-main-icon">
                        <Package size={25} />
                      </span>

                      <div className="order-main-information">
                        <div className="order-number-row">
                          <strong>
                            {order.orderNumber ||
                              `BP-${order._id
                                .slice(-6)
                                .toUpperCase()}`}
                          </strong>

                          <span
                            className={`order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="order-meta">
                          <span>
                            <CalendarDays size={14} />
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <span>
                            <ShoppingBag size={14} />
                            {order.items?.length || 0}{" "}
                            product
                            {order.items?.length === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="order-total">
                        <small>Total</small>

                        <strong>
                          {formatPrice(order.total)}
                        </strong>
                      </div>

                      <ChevronDown
                        className={
                          isExpanded
                            ? "order-chevron expanded"
                            : "order-chevron"
                        }
                        size={21}
                      />
                    </button>

                    <div
                      className={
                        isExpanded
                          ? "order-details expanded"
                          : "order-details"
                      }
                    >
                      <div className="order-details-inner">
                        <div className="order-products">
                          <h3>Products</h3>

                          {order.items?.map(
                            (item, itemIndex) => (
                              <div
                                className="order-product"
                                key={`${order._id}-${itemIndex}`}
                              >
                                <div className="order-product-image">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                    />
                                  ) : (
                                    <Package size={23} />
                                  )}
                                </div>

                                <div className="order-product-content">
                                  <strong>
                                    {item.name}
                                  </strong>

                                  <span>
                                    Quantity:{" "}
                                    {item.quantity}
                                  </span>
                                </div>

                                <strong className="order-product-price">
                                  {formatPrice(
                                    item.price *
                                      item.quantity
                                  )}
                                </strong>
                              </div>
                            )
                          )}
                        </div>

                        <div className="order-delivery">
                          <h3>Delivery</h3>

                          <div className="order-delivery-row">
                            <MapPin size={18} />

                            <div>
                              <strong>
                                {order.customer?.city}
                              </strong>

                              <span>
                                {
                                  order.customer
                                    ?.address
                                }
                              </span>
                            </div>
                          </div>

                          <div className="order-price-breakdown">
                            <div>
                              <span>Subtotal</span>

                              <strong>
                                {formatPrice(
                                  order.subtotal
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Delivery fee
                              </span>

                              <strong>
                                {formatPrice(
                                  order.deliveryFee
                                )}
                              </strong>
                            </div>

                            <div className="order-price-total">
                              <span>Total</span>

                              <strong>
                                {formatPrice(
                                  order.total
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
      </section>
    </main>
  );
}

export default MyOrders;