import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Mail,
  Package,
  Phone,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket";

const CUSTOMERS_PER_PAGE = 8;

function AdminCustomers() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [currentPage, setCurrentPage] =
    useState(1);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(
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

        const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

        const response = await fetch(
          `${API_URL}/users/admin/customers`,
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
              "Unable to load customers."
          );
        }

        setCustomers(data.customers || []);
      } catch (fetchError) {
        console.error(
          "Admin customers error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load customers."
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
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const refreshCustomers = () => {
      fetchCustomers({
        showLoading: false,
      });
    };

    socket.on(
      "new-order",
      refreshCustomers
    );

    socket.on(
      "order-status-updated",
      refreshCustomers
    );

    return () => {
      socket.off(
        "new-order",
        refreshCustomers
      );

      socket.off(
        "order-status-updated",
        refreshCustomers
      );
    };
  }, [fetchCustomers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const statistics = useMemo(() => {
    const activeCustomers = customers.filter(
      (customer) => customer.isActive
    ).length;

    const customersWithOrders =
      customers.filter(
        (customer) =>
          Number(customer.totalOrders) > 0
      ).length;

    const totalCustomerRevenue =
      customers.reduce(
        (total, customer) =>
          total +
          Number(customer.totalSpent || 0),
        0
      );

    return {
      totalCustomers: customers.length,
      activeCustomers,
      customersWithOrders,
      totalCustomerRevenue,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.email,
        customer.phone,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [customers, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        CUSTOMERS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleCustomers = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      CUSTOMERS_PER_PAGE;

    return filteredCustomers.slice(
      startIndex,
      startIndex + CUSTOMERS_PER_PAGE
    );
  }, [filteredCustomers, currentPage]);

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

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
      }
    ).format(date);
  }

  function getInitials(name) {
    const words = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "CU";
    }

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  if (loading) {
    return (
      <section className="admin-section">
        <div className="admin-loading">
          Loading customers...
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            Customer Management
          </span>

          <h1>Customers</h1>

          <p>
            View registered customers and
            their ordering activity.
          </p>
        </div>
      </header>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={24} />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>
              {statistics.totalCustomers}
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={24} />
          </div>

          <div>
            <span>Active Customers</span>
            <strong>
              {statistics.activeCustomers}
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={24} />
          </div>

          <div>
            <span>Customers with Orders</span>

            <strong>
              {
                statistics.customersWithOrders
              }
            </strong>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CircleDollarSign size={24} />
          </div>

          <div>
            <span>Customer Revenue</span>

            <strong>
              {formatCurrency(
                statistics.totalCustomerRevenue
              )}
            </strong>
          </div>
        </article>
      </div>

      <section className="admin-table-card">
        <div className="admin-table-header admin-customer-table-header">
          <div>
            <h2>Customer List</h2>

            <p>
              {filteredCustomers.length} customer
              {filteredCustomers.length === 1
                ? ""
                : "s"}{" "}
              found.
            </p>
          </div>

          <div className="admin-customer-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search name, email or phone..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {visibleCustomers.length === 0 ? (
          <div className="admin-empty-state">
            {searchTerm
              ? "No customers match your search."
              : "No customers have registered yet."}
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCustomers.map(
                    (customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="admin-customer-profile-cell">
                            <div className="admin-customer-avatar">
                              {getInitials(
                                customer.name
                              )}
                            </div>

                            <div>
                              <strong>
                                {customer.name ||
                                  "Unknown customer"}
                              </strong>

                              <span>
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-customer-contact">
                            <span>
                              <Mail size={15} />
                              {customer.email}
                            </span>

                            <span>
                              <Phone size={15} />
                              {customer.phone ||
                                "No phone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-customer-date">
                            <CalendarDays
                              size={15}
                            />

                            {formatDate(
                              customer.createdAt
                            )}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {customer.totalOrders ||
                              0}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatDate(
                            customer.lastOrderAt
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-status ${
                              customer.isActive
                                ? "admin-status-delivered"
                                : "admin-status-cancelled"
                            }`}
                          >
                            {customer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <span>
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
}

export default AdminCustomers;