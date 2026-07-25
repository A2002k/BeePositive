import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import "./css/AdminOrders.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const PRODUCT_PLACEHOLDER =
  "/assets/images/product-placeholder.png";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock3,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
  },
};

const formatCurrency = (amount, currency = "USD") => {
  const value = Number(amount || 0);

  if (currency === "LBP" || currency === "L.L") {
    return `${value.toLocaleString()} L.L`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getOrderNumber = (order) => {
  if (order.orderNumber) {
    return order.orderNumber;
  }

  const id = order._id || order.id || "";

  return `BP-${id.slice(-6).toUpperCase()}`;
};

const getCustomerName = (order) =>
  order.customer?.name ||
  order.user?.name ||
  order.customerName ||
  order.name ||
  "Guest Customer";

const getCustomerPhone = (order) =>
  order.customer?.phone ||
  order.user?.phone ||
  order.phone ||
  "No phone number";

const getDeliveryAddress = (order) =>
  order.shippingAddress?.fullAddress ||
  order.shippingAddress?.address ||
  order.deliveryAddress ||
  order.address ||
  order.location ||
  "No delivery address";

const getOrderItems = (order) => order.items || order.products || [];

const getItemQuantity = (item) => Number(item.quantity || item.qty || 1);

const getItemPrice = (item) =>
  Number(item.price || item.product?.price || 0);

const getItemName = (item) =>
  item.name || item.product?.name || "Honey Product";

const getItemImage = (item) => {
  const firstImage =
    item?.product?.images?.[0] ||
    item?.images?.[0];

  const image =
    item?.image ||
    item?.imageUrl ||
    item?.product?.image ||
    item?.product?.imageUrl ||
    (typeof firstImage === "string"
      ? firstImage
      : firstImage?.url ||
        firstImage?.imageUrl ||
        firstImage?.secure_url) ||
    "";

  if (!image) {
    return PRODUCT_PLACEHOLDER;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SERVER_URL}${image}`;
  }

  if (image.startsWith("uploads/")) {
    return `${SERVER_URL}/${image}`;
  }

  return `${SERVER_URL}/uploads/${image}`;
};

function StatusBadge({ status = "pending" }) {
  const normalizedStatus = status.toLowerCase();
  const config =
    STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`admin-order-status admin-order-status--${normalizedStatus}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function OrderDetailsModal({
  order,
  isUpdating,
  onClose,
  onUpdateStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    order?.status?.toLowerCase() || "pending",
  );

  useEffect(() => {
    setSelectedStatus(order?.status?.toLowerCase() || "pending");
  }, [order]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!order) {
    return null;
  }

  const items = getOrderItems(order);
  const currency = order.currency || "USD";
  const subtotal =
    order.subtotal ??
    items.reduce(
      (sum, item) =>
        sum + getItemPrice(item) * getItemQuantity(item),
      0,
    );

  const deliveryFee = Number(
    order.deliveryFee ?? order.shippingFee ?? 0,
  );

  const total = Number(
    order.totalAmount ?? order.totalPrice ?? order.total ?? 0,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onUpdateStatus(order._id || order.id, selectedStatus);
  };

  return (
    <div
      className="admin-order-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="admin-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <header className="admin-order-modal__header">
          <div>
            <span className="admin-order-modal__eyebrow">
              Order details
            </span>

            <h2 id="order-modal-title">
              {getOrderNumber(order)}
            </h2>

            <p>Placed on {formatDate(order.createdAt)}</p>
          </div>

          <button
            type="button"
            className="admin-order-icon-button"
            onClick={onClose}
            aria-label="Close order details"
          >
            <X size={20} />
          </button>
        </header>

        <div className="admin-order-modal__content">
          <div className="admin-order-modal__main">
            <section className="admin-order-detail-card">
              <div className="admin-order-detail-card__heading">
                <div>
                  <span>Products</span>
                  <h3>Ordered items</h3>
                </div>

                <span className="admin-order-item-count">
                  {items.reduce(
                    (sum, item) => sum + getItemQuantity(item),
                    0,
                  )}{" "}
                  items
                </span>
              </div>

              <div className="admin-order-products">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <article
                      className="admin-order-product"
                      key={
                        item._id ||
                        item.product?._id ||
                        `${getItemName(item)}-${index}`
                      }
                    >
                      <img
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                       onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = PRODUCT_PLACEHOLDER;
                    }}
                      />

                      <div className="admin-order-product__information">
                        <h4>{getItemName(item)}</h4>

                        <p>
                          Quantity: {getItemQuantity(item)}
                        </p>
                      </div>

                      <strong>
                        {formatCurrency(
                          getItemPrice(item) *
                            getItemQuantity(item),
                          currency,
                        )}
                      </strong>
                    </article>
                  ))
                ) : (
                  <div className="admin-order-empty-products">
                    <Package size={24} />
                    No products were found in this order.
                  </div>
                )}
              </div>
            </section>

            <section className="admin-order-detail-card">
              <div className="admin-order-detail-card__heading">
                <div>
                  <span>Delivery</span>
                  <h3>Customer information</h3>
                </div>
              </div>

              <div className="admin-order-customer-details">
                <div className="admin-order-information-row">
                  <span className="admin-order-information-icon">
                    <UserRound size={18} />
                  </span>

                  <div>
                    <small>Customer</small>
                    <strong>{getCustomerName(order)}</strong>

                    {order.customer?.email || order.user?.email ? (
                      <p>
                        {order.customer?.email ||
                          order.user?.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="admin-order-information-row">
                  <span className="admin-order-information-icon">
                    <Phone size={18} />
                  </span>

                  <div>
                    <small>Phone number</small>
                    <strong>{getCustomerPhone(order)}</strong>
                  </div>
                </div>

                <div className="admin-order-information-row">
                  <span className="admin-order-information-icon">
                    <MapPin size={18} />
                  </span>

                  <div>
                    <small>Delivery address</small>
                    <strong>{getDeliveryAddress(order)}</strong>

                    {order.shippingAddress?.notes ||
                    order.deliveryNotes ? (
                      <p>
                        {order.shippingAddress?.notes ||
                          order.deliveryNotes}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="admin-order-information-row">
                  <span className="admin-order-information-icon">
                    <CircleDollarSign size={18} />
                  </span>

                  <div>
                    <small>Payment method</small>
                    <strong>
                      {order.paymentMethod ||
                        "Cash on delivery"}
                    </strong>

                    <p>
                      {order.paymentStatus === "paid"
                        ? "Payment completed"
                        : "Payment pending"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="admin-order-modal__sidebar">
            <section className="admin-order-detail-card">
              <div className="admin-order-detail-card__heading">
                <div>
                  <span>Management</span>
                  <h3>Order status</h3>
                </div>
              </div>

              <form
                className="admin-order-status-form"
                onSubmit={handleSubmit}
              >
                <label htmlFor="order-status">
                  Current fulfillment status
                </label>

                <div className="admin-order-select-wrapper">
                  <select
                    id="order-status"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(event.target.value)
                    }
                    disabled={isUpdating}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option value={status} key={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={17} />
                </div>

                <button
                  type="submit"
                  className="admin-order-primary-button"
                  disabled={
                    isUpdating ||
                    selectedStatus ===
                      order.status?.toLowerCase()
                  }
                >
                  {isUpdating ? (
                    <LoaderCircle
                      className="admin-order-spinner"
                      size={18}
                    />
                  ) : (
                    <Check size={18} />
                  )}

                  {isUpdating
                    ? "Updating..."
                    : "Update status"}
                </button>
              </form>
            </section>

            <section className="admin-order-detail-card">
              <div className="admin-order-detail-card__heading">
                <div>
                  <span>Summary</span>
                  <h3>Payment total</h3>
                </div>
              </div>

              <div className="admin-order-payment-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    {formatCurrency(subtotal, currency)}
                  </strong>
                </div>

                <div>
                  <span>Delivery fee</span>
                  <strong>
                    {deliveryFee > 0
                      ? formatCurrency(deliveryFee, currency)
                      : "Free"}
                  </strong>
                </div>

                {order.discountAmount ? (
                  <div>
                    <span>Discount</span>
                    <strong>
                      -
                      {formatCurrency(
                        order.discountAmount,
                        currency,
                      )}
                    </strong>
                  </div>
                ) : null}

                <div className="admin-order-payment-summary__total">
                  <span>Total</span>
                  <strong>
                    {formatCurrency(total, currency)}
                  </strong>
                </div>
              </div>
            </section>

            {order.notes ? (
              <section className="admin-order-detail-card">
                <div className="admin-order-detail-card__heading">
                  <div>
                    <span>Notes</span>
                    <h3>Customer message</h3>
                  </div>
                </div>

                <p className="admin-order-customer-note">
                  {order.notes}
                </p>
              </section>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token =
    sessionStorage.getItem("beepositivetoken") ||
    localStorage.getItem("beepositiveToken");

  const fetchOrders = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await fetch(`${API_URL}/orders/admin`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load the orders.",
          );
        }

        const receivedOrders = Array.isArray(data)
          ? data
          : data.orders || [];

        setOrders(receivedOrders);
      } catch (requestError) {
        console.error("Fetch admin orders error:", requestError);

        setError(
          requestError.message ||
            "Something went wrong while loading orders.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const status = (
        order.status || "pending"
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const searchableContent = [
        getOrderNumber(order),
        getCustomerName(order),
        getCustomerPhone(order),
        getDeliveryAddress(order),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableContent.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const totalRevenue = orders
      .filter(
        (order) =>
          order.status?.toLowerCase() !== "cancelled",
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount ??
              order.totalPrice ??
              order.total ??
              0,
          ),
        0,
      );

    return {
      total: orders.length,
      pending: orders.filter(
        (order) =>
          order.status?.toLowerCase() === "pending",
      ).length,
      processing: orders.filter((order) =>
        ["confirmed", "processing", "shipped"].includes(
          order.status?.toLowerCase(),
        ),
      ).length,
      delivered: orders.filter(
        (order) =>
          order.status?.toLowerCase() === "delivered",
      ).length,
      revenue: totalRevenue,
    };
  }, [orders]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize),
  );

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredOrders.slice(
      startIndex,
      startIndex + pageSize,
    );
  }, [filteredOrders, currentPage, pageSize]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update order status.",
        );
      }

      const updatedOrder = data.order || data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          (order._id || order.id) === orderId
            ? {
                ...order,
                ...updatedOrder,
                status: newStatus,
              }
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              ...updatedOrder,
              status: newStatus,
            }
          : null,
      );

      setSuccessMessage(
        `Order status changed to ${
          STATUS_CONFIG[newStatus]?.label || newStatus
        }.`,
      );
    } catch (requestError) {
      console.error("Update order error:", requestError);

      setError(
        requestError.message ||
          "Something went wrong while updating the order.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages),
    );
  };

  const firstVisibleOrder =
    filteredOrders.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const lastVisibleOrder = Math.min(
    currentPage * pageSize,
    filteredOrders.length,
  );

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-background-glow" />

      <div className="admin-orders-container">
        <header className="admin-orders-header">
          <div>
            <span className="admin-orders-eyebrow">
              BeePositive Administration
            </span>

            <h1>Orders Management</h1>

            <p>
              Review customer purchases, manage deliveries and
              keep every order moving.
            </p>
          </div>

          <button
            type="button"
            className="admin-orders-refresh-button"
            onClick={() => fetchOrders({ refresh: true })}
            disabled={isRefreshing}
          >
            <RefreshCw
              size={18}
              className={
                isRefreshing ? "admin-order-spinner" : ""
              }
            />

            {isRefreshing ? "Refreshing..." : "Refresh orders"}
          </button>
        </header>

        {successMessage ? (
          <div className="admin-order-alert admin-order-alert--success">
            <CheckCircle2 size={19} />
            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Close message"
            >
              <X size={17} />
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="admin-order-alert admin-order-alert--error">
            <AlertCircle size={19} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={17} />
            </button>
          </div>
        ) : null}

        <section className="admin-orders-statistics">
          <article className="admin-orders-stat-card">
            <span className="admin-orders-stat-card__icon">
              <ShoppingBag size={22} />
            </span>

            <div>
              <p>Total orders</p>
              <strong>{statistics.total}</strong>
              <small>All customer orders</small>
            </div>
          </article>

          <article className="admin-orders-stat-card">
            <span className="admin-orders-stat-card__icon">
              <Clock3 size={22} />
            </span>

            <div>
              <p>Pending review</p>
              <strong>{statistics.pending}</strong>
              <small>Waiting for confirmation</small>
            </div>
          </article>

          <article className="admin-orders-stat-card">
            <span className="admin-orders-stat-card__icon">
              <Truck size={22} />
            </span>

            <div>
              <p>In progress</p>
              <strong>{statistics.processing}</strong>
              <small>Preparing or delivering</small>
            </div>
          </article>

          <article className="admin-orders-stat-card">
            <span className="admin-orders-stat-card__icon">
              <CircleDollarSign size={22} />
            </span>

            <div>
              <p>Total revenue</p>
              <strong>
                {formatCurrency(statistics.revenue)}
              </strong>
              <small>{statistics.delivered} delivered orders</small>
            </div>
          </article>
        </section>

        <section className="admin-orders-panel">
          <div className="admin-orders-toolbar">
            <div className="admin-orders-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search order, customer, phone or address..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              ) : null}
            </div>

            <div className="admin-orders-filter">
              <label htmlFor="status-filter">Status</label>

              <div className="admin-order-select-wrapper">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="all">All statuses</option>

                  {STATUS_OPTIONS.map((status) => (
                    <option value={status} key={status}>
                      {STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>

                <ChevronDown size={17} />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="admin-orders-state">
              <LoaderCircle
                className="admin-order-spinner"
                size={32}
              />

              <h3>Loading orders</h3>

              <p>
                Retrieving the latest customer orders.
              </p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="admin-orders-state">
              <Package size={34} />

              <h3>No orders found</h3>

              <p>
                Try changing your search or status filter.
              </p>

              {(searchTerm || statusFilter !== "all") && (
                <button
                  type="button"
                  className="admin-order-secondary-button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="admin-orders-table-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Products</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th aria-label="Order actions" />
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.map((order) => {
                      const items = getOrderItems(order);
                      const itemCount = items.reduce(
                        (sum, item) =>
                          sum + getItemQuantity(item),
                        0,
                      );

                      return (
                        <tr key={order._id || order.id}>
                          <td data-label="Order">
                            <div className="admin-order-id-cell">
                              <span>
                                <Package size={18} />
                              </span>

                              <div>
                                <strong>
                                  {getOrderNumber(order)}
                                </strong>

                                <small>
                                  {order.paymentMethod ||
                                    "Cash on delivery"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td data-label="Customer">
                            <div className="admin-order-customer-cell">
                              <strong>
                                {getCustomerName(order)}
                              </strong>

                              <span>
                                {getCustomerPhone(order)}
                              </span>
                            </div>
                          </td>

                          <td data-label="Products">
                            <div className="admin-order-products-cell">
                              <div className="admin-order-product-images">
                                {items.slice(0, 3).map(
                                  (item, index) => (
                                    <img
                                      key={
                                        item._id ||
                                        item.product?._id ||
                                        index
                                      }
                                      src={getItemImage(item)}
                                      alt=""
                                      onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = PRODUCT_PLACEHOLDER;
                                      }}
                                    />
                                  ),
                                )}
                              </div>

                              <span>
                                {itemCount}{" "}
                                {itemCount === 1
                                  ? "item"
                                  : "items"}
                              </span>
                            </div>
                          </td>

                          <td data-label="Total">
                            <strong className="admin-order-total">
                              {formatCurrency(
                                order.totalAmount ??
                                  order.totalPrice ??
                                  order.total ??
                                  0,
                                order.currency || "USD",
                              )}
                            </strong>
                          </td>

                          <td data-label="Date">
                            <div className="admin-order-date-cell">
                              <CalendarDays size={15} />
                              <span>
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </td>

                          <td data-label="Status">
                            <StatusBadge
                              status={order.status}
                            />
                          </td>

                          <td data-label="Actions">
                            <button
                              type="button"
                              className="admin-order-view-button"
                              onClick={() =>
                                setSelectedOrder(order)
                              }
                            >
                              <Eye size={17} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="admin-orders-pagination">
                <p>
                  Showing <strong>{firstVisibleOrder}</strong>–
                  <strong>{lastVisibleOrder}</strong> of{" "}
                  <strong>{filteredOrders.length}</strong> orders
                </p>

                <div>
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>

      {selectedOrder ? (
        <OrderDetailsModal
          order={selectedOrder}
          isUpdating={isUpdating}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
        />
      ) : null}
    </main>
  );
}

export default AdminOrders;