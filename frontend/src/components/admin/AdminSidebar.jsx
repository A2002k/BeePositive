import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function AdminSidebar({
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  const handleNavigation = () => {
    onClose?.();
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? "admin-nav-link active"
      : "admin-nav-link";

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-overlay ${
          isOpen ? "show" : ""
        }`}
        aria-label="Close admin menu"
        onClick={onClose}
      />

      <aside
        className={`admin-sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="admin-sidebar-mobile-header">
          <span>Admin Menu</span>

          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Close admin menu"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className="admin-brand">
          <img
            src="/navbar-logo.png"
            alt="BeePositive"
            className="admin-brand-logo"
          />

          <span className="admin-brand-label">
            Admin Panel
          </span>
        </div>

        <nav className="admin-navigation">
          <NavLink
            to="/admin/dashboard"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <Package size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <Users size={20} />
            <span>Customers</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default AdminSidebar;