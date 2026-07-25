import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? "admin-nav-link active"
      : "admin-nav-link";

  return (
    <aside className="admin-sidebar">
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
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={getNavLinkClass}
        >
          <ShoppingBag size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={getNavLinkClass}
        >
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={getNavLinkClass}
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
  );
}

export default AdminSidebar;