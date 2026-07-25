import {
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function AdminDashboard() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!token) {
        setLoading(false);

        setError(
          "Authentication token is missing. Please log in again."
        );

        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
  `${API_URL}/orders/admin`,
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
              "Unable to load admin orders."
          );
        }

        setOrders(data.orders || []);
      } catch (fetchError) {
        console.error(
          "Admin dashboard error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load dashboard."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      console.log(
        "Dashboard received a new order:",
        newOrder
      );

      /*
        Refetch from the backend so the dashboard
        receives the full order, including customer
        details, items and every database field.
      */
      fetchOrders({
        showLoading: false,
      });
    };

    socket.on("new-order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
    };
  }, [fetchOrders]);

  const statistics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (total, order) => {
        const normalizedStatus =
          order.status?.toLowerCase();

        if (normalizedStatus === "cancelled") {
          return total;
        }

        return total + Number(order.total || 0);
      },
      0
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.status?.toLowerCase() === "pending"
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "delivered"
    ).length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function getStatusClass(status) {
    return (
      status
        ?.toLowerCase()
        .replaceAll(" ", "-") || "pending"
    );
  }

  function formatStatus(status) {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  }

  if (loading) {
    return (
      <section className="admin-section">
        <div className="admin-loading">
          Loading dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            BeePositive Management
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor sales, orders, and customer
            activity.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="admin-primary-button"
        >
          Manage Orders
        </Link>
      </header>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={24} />
          </div>

          <div>
            <span>Total Orders</span>

            <strong>
              {statistics.totalOrders}
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CircleDollarSign size={24} />
          </div>

          <div>
            <span>Total Revenue</span>

            <strong>
              {formatCurrency(
                statistics.totalRevenue
              )}
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Clock3 size={24} />
          </div>

          <div>
            <span>Pending Orders</span>

            <strong>
              {statistics.pendingOrders}
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <PackageCheck size={24} />
          </div>

          <div>
            <span>Delivered</span>

            <strong>
              {statistics.deliveredOrders}
            </strong>
          </div>
        </article>
      </div>

      <section className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>Recent Orders</h2>

            <p>
              The latest customer orders.
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="admin-text-link"
          >
            View all orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty-state">
            No orders have been placed yet.
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>
                        {order.orderNumber ||
                          order._id}
                      </strong>
                    </td>

                    <td>
                      <div className="admin-customer-cell">
                        <strong>
                          {order.customer?.name ||
                            order.user?.name ||
                            "Unknown customer"}
                        </strong>

                        <span>
                          {order.customer?.email ||
                            order.user?.email ||
                            "No email"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {formatDate(order.createdAt)}
                    </td>

                    <td>
                      {formatCurrency(order.total)}
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${getStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminDashboard;