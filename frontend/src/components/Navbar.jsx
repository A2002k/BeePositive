import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const links = [
    {
      name: "Home",
      href: "/#home",
    },
    {
      name: "Products",
      href: "/products",
    },
    {
      name: "Our Story",
      href: "/#story",
    },
    {
      name: "How It’s Made",
      href: "/#process",
    },
    {
      name: "Contact",
      href: "/#contact",
    },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky left-0 top-0 z-50 w-full">
      <div className="border-b border-amber-300/10 bg-black/50 backdrop-blur-xl">
       <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-2 lg:px-12">
          <Link
            to="/"
            className="group flex items-center gap-3"
            onClick={closeMenu}
            aria-label="BeePositive home"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-black shadow-lg shadow-amber-500/10 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-amber-300/70 group-hover:shadow-amber-500/20">
              <img
                src="/navbar-logo.png"
                alt="BeePositive logo"
                className="h-full w-full object-cover"
              />

              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white">
                Bee
                <span className="text-amber-300">
                  Positive
                </span>
              </span>

              <span className="text-[9px] font-semibold tracking-[0.32em] text-amber-100/70">
                PURE HONEY
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative text-sm font-medium text-white/90 transition hover:text-amber-400"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              type="button"
              aria-label="Search"
              className="rounded-full p-2 text-white transition hover:bg-white/10 hover:text-amber-400"
            >
              <Search size={21} />
            </button>

            <Link
              to={
                isAuthenticated
                  ? "/profile"
                  : "/login"
              }
              aria-label={
                isAuthenticated
                  ? "Open account"
                  : "Log in"
              }
              className="rounded-full p-2 text-white transition hover:bg-white/10 hover:text-amber-400"
            >
              <UserRound size={21} />
            </Link>

            <Link
              to="/cart"
              aria-label={`Open cart with ${cartCount} items`}
              className="relative rounded-full p-2 text-white transition hover:bg-white/10 hover:text-amber-400"
            >
              <ShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-black">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/products"
              className="ml-2 rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Order Now
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              aria-label={`Open cart with ${cartCount} items`}
              className="relative rounded-lg border border-white/20 p-2 text-white transition hover:border-amber-400 hover:text-amber-400"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-black">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() =>
                setMenuOpen(
                  (current) => !current
                )
              }
              className="rounded-lg border border-white/20 p-2 text-white"
            >
              {menuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div className="border-b border-white/10 bg-[#100b06]/95 px-6 py-6 backdrop-blur-xl lg:hidden">


          <div className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={closeMenu}
                className="text-lg font-medium text-white transition hover:text-amber-400"
              >
                {link.name}
              </Link>
            ))}

            <Link
              to={
                isAuthenticated
                  ? "/profile"
                  : "/login"
              }
              onClick={closeMenu}
              className="flex items-center gap-3 text-lg font-medium text-white transition hover:text-amber-400"
            >
              <UserRound size={20} />

              {isAuthenticated
                ? "My Account"
                : "Log In"}
            </Link>

            <Link
              to="/cart"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-lg border border-white/10 px-5 py-3 font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={19} />
                Shopping Cart
              </span>

              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 text-xs font-bold text-black">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/products"
              onClick={closeMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black"
            >
              <ShoppingCart size={19} />
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;