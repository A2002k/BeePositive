import {
  Bell,
  Menu,
  Search,
  UserCircle2,
  X,
} from "lucide-react";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import AdminSidebar from "./AdminSidebar";
import { socket } from "../../socket";
import "../../css/Admin.css";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] = useState(false);

  const pageTitle =
    {
      "/admin/dashboard": "Dashboard",
      "/admin/orders": "Orders",
      "/admin/products": "Products",
      "/admin/customers": "Customers",
    }[location.pathname] || "Admin";

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  useEffect(() => {
    audioRef.current = new Audio(
      "/sounds/new-order.mp3"
    );

    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.8;

    const handleConnect = () => {
      console.log(
        "Admin socket connected:",
        socket.id
      );

      socket.emit("join-admin");
    };

    const handleConnectError = (error) => {
      console.error(error.message);
    };

    const handleNewOrder = (order) => {
      const notification = {
        id: `${order._id}-${Date.now()}`,
        orderId: order._id,
        title: "New order received",
        message: `${
          order.customerName || "A customer"
        } placed order #${
          order.orderNumber || ""
        }.`,
        total: order.total || 0,
        createdAt:
          order.createdAt ||
          new Date().toISOString(),
        read: false,
      };

      setNotifications((current) => [
        notification,
        ...current,
      ]);

      audioRef.current
        ?.play()
        .catch(() => {});
    };

    socket.on("connect", handleConnect);
    socket.on(
      "connect_error",
      handleConnectError
    );
    socket.on("new-order", handleNewOrder);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off(
        "connect_error",
        handleConnectError
      );
      socket.off(
        "new-order",
        handleNewOrder
      );
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleNotificationClick = (
    notification
  ) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );

    setIsNotificationOpen(false);
    navigate("/admin/orders");
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  return (
    <div className="admin-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <main className="admin-content">
        {/* Mobile Topbar */}
<header className="admin-mobile-topbar">
  <button
    type="button"
    className="admin-mobile-menu-button"
    aria-label="Open admin menu"
    onClick={() => setSidebarOpen(true)}
  >
    <Menu size={22} />
  </button>

  <div className="admin-mobile-title">
    <strong>BeePositive</strong>
    <span>{pageTitle}</span>
  </div>

  <div className="admin-mobile-actions">
    <div className="admin-notification-wrapper">
      <button
        type="button"
        className="admin-icon-button admin-notification-button"
        aria-label="Notifications"
        onClick={() =>
          setIsNotificationOpen(
            (current) => !current
          )
        }
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="admin-notification-badge">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="admin-notification-dropdown">
          <div className="admin-notification-header">
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount} unread</p>
            </div>

            <button
              type="button"
              className="admin-notification-close"
              aria-label="Close notifications"
              onClick={() =>
                setIsNotificationOpen(false)
              }
            >
              <X size={18} />
            </button>
          </div>

          {notifications.length > 0 ? (
            <>
              <div className="admin-notification-list">
                {notifications.map(
                  (notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`admin-notification-item ${
                        notification.read
                          ? "read"
                          : "unread"
                      }`}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                    >
                      <span className="admin-notification-dot" />

                      <div>
                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <small>
                          $
                          {Number(
                            notification.total
                          ).toFixed(2)}
                        </small>
                      </div>
                    </button>
                  )
                )}
              </div>

              <div className="admin-notification-footer">
                <button
                  type="button"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>

                <button
                  type="button"
                  onClick={clearNotifications}
                >
                  Clear all
                </button>
              </div>
            </>
          ) : (
            <div className="admin-notification-empty">
              <Bell size={30} />
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</header>

        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;