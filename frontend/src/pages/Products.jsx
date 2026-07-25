import { useEffect, useMemo, useState,  useCallback } from "react";
import {
  Check,
  PackageSearch,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { socket } from "../socket";
import { getProductImageUrl, productImageFallback,} from "../utils/getProductImageUrl";
import "./css/Products.css";
import { useCart } from "../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function Products() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedProductId, setAddedProductId] = useState("");
  const [toast, setToast] = useState(null);

   const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_URL}/products`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load products."
      );
    }

    setProducts(data.products || []);
  } catch (error) {
    console.error(
      "Products loading error:",
      error
    );

    setError(
      error.message ||
        "Unable to load products."
    );
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);

useEffect(() => {
  const handleStockUpdated = () => {
    fetchProducts();
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

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.weight,
        product.weightUnit,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [products, searchTerm]);

  

const handleAddToCart = (product) => {
  const availableStock = Number(product.stock ?? 0);

  if (availableStock <= 0) {
    setToast({
      id: Date.now(),
      type: "error",
      name: `${product.name} is out of stock.`,
      image: getProductImageUrl(product),
    });

    return;
  }

  addToCart(product);

  setAddedProductId(product._id);

  setToast({
    id: Date.now(),
    type: "success",
    name: product.name,
    image: getProductImageUrl(product),
  });

  window.setTimeout(() => {
    setAddedProductId((currentId) =>
      currentId === product._id ? "" : currentId
    );
  }, 1300);
};

  return (
    <main className="products-page">
      {toast && (
        <div
          className="cart-toast"
          role="status"
          aria-live="polite"
        >
          <div className={`cart-toast-icon ${ toast.type === "error" ? "is-error" : ""}`}>
            <Check size={18} />
          </div>

          <img
            src={toast.image}
            alt={toast.name}
            className="cart-toast-image"
          />

          <strong>
                {toast.type === "error"
                  ? "Product Unavailable"
                  : "Added to Cart"}
              </strong>

              <span>{toast.name}</span>

          <button
            type="button"
            className="cart-toast-close"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            <X size={17} />
          </button>

          <div className="cart-toast-progress" />
        </div>
      )}

      <div className="products-glow products-glow-one" />
      <div className="products-glow products-glow-two" />

      <section className="products-hero">
        <div className="products-eyebrow">
          <Sparkles size={15} />
          BeePositive Collection
        </div>

        <h1>
          Pure products from the
          <span> heart of the hive.</span>
        </h1>

        <p>
          Discover carefully selected honey and
          beekeeping products created with quality,
          authenticity and the natural spirit of
          BeePositive.
        </p>

        <div className="products-search">
          <Search size={19} />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search honey, products or weight..."
            aria-label="Search products"
          />
        </div>
      </section>

      <section className="products-content">
        <div className="products-toolbar">
          <div>
            <span>Our Collection</span>

            <h2>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1
                      ? "product"
                      : "products"
                  }`}
            </h2>
          </div>

          <p>
            Natural quality. Carefully prepared.
            Made for people who value the hive.
          </p>
        </div>

        {loading && (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <article
                  key={item}
                  className="product-card product-skeleton"
                >
                  <div className="skeleton-image" />

                  <div className="product-content">
                    <div className="skeleton-line skeleton-line-small" />
                    <div className="skeleton-line skeleton-line-title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {!loading && error && (
          <div className="products-state products-error">
            <PackageSearch size={46} />

            <h2>Unable to load products</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="products-state">
              <PackageSearch size={46} />

              <h2>No products found</h2>

              <p>
                Try another product name, category
                or weight.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear Search
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map(
                (product) => {
                  const isAdded =
                  addedProductId === product._id;

                const productStock = Number(product.stock ?? 0);

                const isOutOfStock = productStock <= 0;

                const isLowStock =
                  productStock > 0 && productStock <= 5;

                  return (
                    <article
                      className="product-card"
                      key={product._id}
                    >
                      <div className="product-image-wrapper">
                        <div className="product-image-glow" />

                        {product.bestSeller && (
                          <span className="product-badge">
                            Bestseller
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="product-stock-badge">
                            Out of stock
                          </span>
                        )}

                        <img
                            src={getProductImageUrl(product)}
                            alt={product.images?.[0]?.alt || product.name}
                            className="product-image"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                productImageFallback;
                            }}
                          />
                      </div>

                      <div className="product-content">
                        <div className="product-meta">
                          <span>
                            {product.category ||
                              "BeePositive"}
                          </span>

                          {product.weight && (
                            <span>
                              {product.weight}{" "}
                              {product.weightUnit}
                            </span>
                          )}
                        </div>

                   <h2>{product.name}</h2>

                              <div
                                className={`product-stock-status ${
                                  isOutOfStock
                                    ? "is-out"
                                    : isLowStock
                                    ? "is-low"
                                    : "is-available"
                                }`}
                              >
                                <span className="product-stock-dot" />

                                {isOutOfStock
                                  ? "Out of Stock"
                                  : isLowStock
                                  ? `Only ${productStock} left in stock`
                                  : "In Stock"}
                              </div>

                              <p className="product-description">
                                {product.description ||
                                  "A carefully prepared BeePositive product inspired by the natural quality of the hive."}
                              </p>

                        <div className="product-footer">
                          <div className="product-price">
                            <small>Price</small>

                            <strong>
                              $
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </strong>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className={`add-cart-button ${
                              isAdded
                                ? "is-added"
                                : ""
                            }`}
                            onClick={() =>
                              handleAddToCart(product)
                            }
                          >
                            {isAdded ? (
                              <>
                                <Check size={17} />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={17}
                                />

                                {isOutOfStock
                                  ? "Unavailable"
                                  : "Add to Cart"}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </section>
    </main>
  );
}

export default Products;