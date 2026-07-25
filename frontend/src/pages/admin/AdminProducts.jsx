import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { socket } from "../../socket";
import DeleteProductModal from "./components/DeleteProductModal";
import ProductFormModal from "./components/ProductFormModal";
import ProductTable from "./components/ProductTable";

import "./css/AdminProducts.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [productToDelete, setProductToDelete] =
    useState(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const token =
    localStorage.getItem("beepositiveToken");

  const fetchProducts = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await fetch(
          `${API_URL}/products/admin`,
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
              "Unable to load products."
          );
        }

        setProducts(data.products || []);
      } catch (requestError) {
        console.error(
          "Fetch admin products error:",
          requestError
        );

        setError(
          requestError.message ||
            "Something went wrong while loading products."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

useEffect(() => {
  const handleStockUpdated = () => {
    fetchProducts({
      refresh: true,
    });
  };

  socket.on(
    "stock-updated",
    handleStockUpdated
  );

  return () => {
    socket.off(
      "stock-updated",
      handleStockUpdated
    );
  };
}, [fetchProducts]);

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);

useEffect(() => {
  const handleStockUpdated = () => {
    fetchProducts({
      refresh: true,
    });
  };

  socket.on("stock-updated", handleStockUpdated);

  return () => {
    socket.off(
      "stock-updated",
      handleStockUpdated
    );
  };
}, [fetchProducts]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () =>
      window.clearTimeout(timeout);
  }, [successMessage]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.slug
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          product.isActive) ||
        (statusFilter === "inactive" &&
          !product.isActive) ||
        (statusFilter === "low-stock" &&
          Number(product.stock) <= 5);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: products.length,

      active: products.filter(
        (product) => product.isActive
      ).length,

      inactive: products.filter(
        (product) => !product.isActive
      ).length,

      lowStock: products.filter(
        (product) =>
          Number(product.stock || 0) <= 5
      ).length,
    };
  }, [products]);

  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (isSaving) {
      return;
    }

    setSelectedProduct(null);
    setIsFormOpen(false);
  };

  const saveProduct = async (
    formData,
    productId
  ) => {
    try {
      setIsSaving(true);
      setError("");

      const isEditing = Boolean(productId);

      const endpoint = isEditing
        ? `${API_URL}/products/${productId}`
        : `${API_URL}/products`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save the product."
        );
      }

      const savedProduct = data.product;

      if (isEditing) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === savedProduct._id
              ? savedProduct
              : product
          )
        );
      } else {
        setProducts((currentProducts) => [
          savedProduct,
          ...currentProducts,
        ]);
      }

      setSuccessMessage(
        isEditing
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (requestError) {
      console.error(
        "Save product error:",
        requestError
      );

      throw requestError;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete?._id) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete the product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product._id !==
            productToDelete._id
        )
      );

      setSuccessMessage(
        "Product deleted successfully."
      );

      setProductToDelete(null);
    } catch (requestError) {
      console.error(
        "Delete product error:",
        requestError
      );

      setError(
        requestError.message ||
          "Something went wrong while deleting the product."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="admin-products-page">
      <div className="admin-products-glow" />

      <div className="admin-products-container">
        <header className="admin-products-header">
          <div>
            <span className="admin-products-eyebrow">
              BeePositive Administration
            </span>

            <h1>Product Management</h1>

            <p>
              Add products, manage inventory and
              control what customers can purchase.
            </p>
          </div>

          <div className="admin-products-header-actions">
            <button
              type="button"
              className="admin-products-refresh-button"
              onClick={() =>
                fetchProducts({
                  refresh: true,
                })
              }
              disabled={isRefreshing}
            >
              <RefreshCw
                size={18}
                className={
                  isRefreshing
                    ? "admin-products-spinner"
                    : ""
                }
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="admin-products-add-button"
              onClick={openCreateModal}
            >
              <Plus size={19} />
              Add product
            </button>
          </div>
        </header>

        {successMessage ? (
          <div className="admin-products-alert admin-products-alert--success">
            <CheckCircle2 size={19} />

            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
            >
              ×
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="admin-products-alert admin-products-alert--error">
            <AlertCircle size={19} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        ) : null}

        <section className="admin-products-statistics">
          <article>
            <span>
              <Package size={21} />
            </span>

            <div>
              <p>Total products</p>
              <strong>{statistics.total}</strong>
            </div>
          </article>

          <article>
            <span>
              <CheckCircle2 size={21} />
            </span>

            <div>
              <p>Active products</p>
              <strong>{statistics.active}</strong>
            </div>
          </article>

          <article>
            <span>
              <AlertCircle size={21} />
            </span>

            <div>
              <p>Inactive products</p>
              <strong>{statistics.inactive}</strong>
            </div>
          </article>

          <article>
            <span>
              <Package size={21} />
            </span>

            <div>
              <p>Low stock</p>
              <strong>{statistics.lowStock}</strong>
            </div>
          </article>
        </section>

        <section className="admin-products-panel">
          <div className="admin-products-toolbar">
            <div className="admin-products-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search product, category or slug..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All products
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="low-stock">
                Low stock
              </option>
            </select>
          </div>

          {isLoading ? (
            <div className="admin-products-state">
              <LoaderCircle
                size={34}
                className="admin-products-spinner"
              />

              <h3>Loading products</h3>

              <p>
                Retrieving your product catalogue.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-products-state">
              <Package size={38} />

              <h3>No products found</h3>

              <p>
                Add your first product or change
                the current filters.
              </p>

              <button
                type="button"
                className="admin-products-add-button"
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Add product
              </button>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={openEditModal}
              onDelete={setProductToDelete}
            />
          )}
        </section>
      </div>

      {isFormOpen ? (
        <ProductFormModal
          product={selectedProduct}
          isSaving={isSaving}
          onClose={closeFormModal}
          onSave={saveProduct}
        />
      ) : null}

      {productToDelete ? (
        <DeleteProductModal
          product={productToDelete}
          isDeleting={isDeleting}
          onClose={() =>
            setProductToDelete(null)
          }
          onConfirm={deleteProduct}
        />
      ) : null}
    </main>
  );
}

export default AdminProducts;