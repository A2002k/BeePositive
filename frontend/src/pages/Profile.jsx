import {
  ArrowRight,
  Home,
  LogOut,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./css/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { clearCart } = useCart();

  const handleLogout = () => {
    clearCart();
    logout();

    navigate("/", {
      replace: true,
    });
  };

  const firstName =
    user?.name?.split(" ")[0] || "Customer";

  return (
    <main className="profile-page">
      <div className="profile-background-glow" />

      <section className="profile-container">
        <header className="profile-hero">
          <div>
            <span className="profile-eyebrow">
              BeePositive Account
            </span>

            <h1>
              Welcome back, <span>{firstName}</span>.
            </h1>

            <p>
              Manage your profile, view your orders and
              continue exploring BeePositive products.
            </p>
          </div>

          <div className="profile-avatar">
            <UserRound size={42} />

            <span className="profile-online-dot" />
          </div>
        </header>

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <span>Personal Information</span>
                <h2>Your profile</h2>
              </div>

              <ShieldCheck size={28} />
            </div>

            <div className="profile-information">
              <div className="profile-information-row">
                <span className="profile-information-icon">
                  <UserRound size={20} />
                </span>

                <div>
                  <small>Full name</small>
                  <strong>{user?.name}</strong>
                </div>
              </div>

              <div className="profile-information-row">
                <span className="profile-information-icon">
                  <Mail size={20} />
                </span>

                <div>
                  <small>Email address</small>
                  <strong>{user?.email}</strong>
                </div>
              </div>

              <div className="profile-information-row">
                <span className="profile-information-icon">
                  <Phone size={20} />
                </span>

                <div>
                  <small>Phone number</small>

                  <strong>
                    {user?.phone ||
                      "No phone number added"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <aside className="profile-actions">
            <Link
              to="/"
              className="profile-action-card"
            >
              <span className="profile-action-icon">
                <Home size={23} />
              </span>

              <div>
                <strong>Back to Home</strong>

                <p>
                  Return to the BeePositive homepage.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/my-orders"
              className="profile-action-card"
            >
              <span className="profile-action-icon">
                <Package size={23} />
              </span>

              <div>
                <strong>My Orders</strong>

                <p>
                  Follow your purchases and delivery
                  status.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/products"
              className="profile-action-card"
            >
              <span className="profile-action-icon">
                <Package size={23} />
              </span>

              <div>
                <strong>Continue Shopping</strong>

                <p>
                  Discover natural honey and hive
                  products.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={19} />
              Sign Out
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Profile;