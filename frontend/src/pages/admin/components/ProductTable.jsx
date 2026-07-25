import {
  Edit3,
  Leaf,
  Package,
  Star,
  Trash2,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const PRODUCT_PLACEHOLDER =
  "/assets/images/product-placeholder.png";

const getProductImage = (product) => {
  const firstImage = product?.images?.[0];

  const imageUrl =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url ||
        firstImage?.imageUrl ||
        firstImage?.secure_url ||
        product?.image ||
        product?.imageUrl ||
        product?.thumbnail ||
        "";

  if (!imageUrl) {
    return PRODUCT_PLACEHOLDER;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  if (imageUrl.startsWith("uploads/")) {
    return `${BACKEND_URL}/${imageUrl}`;
  }

  return `${BACKEND_URL}/uploads/${imageUrl}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price || 0));
};

function ProductTable({
  products,
  onEdit,
  onDelete,
}) {
  return (
    <div className="admin-products-table-wrapper">
      <table className="admin-products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Inventory</th>
            <th>Features</th>
            <th>Status</th>
            <th aria-label="Product actions" />
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td data-label="Product">
                <div className="admin-product-information">
                  <img
                    src={getProductImage(product)}
                    alt={
                      product.images?.[0]?.alt ||
                      product.name ||
                      "BeePositive product"
                    }
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src =
                        PRODUCT_PLACEHOLDER;
                    }}
                  />

                  <div>
                    <strong>{product.name}</strong>

                    <span>{product.slug}</span>
                  </div>
                </div>
              </td>

              <td data-label="Category">
                {product.category}
              </td>

              <td data-label="Price">
                <strong className="admin-product-price">
                  {formatPrice(product.price)}
                </strong>
              </td>

              <td data-label="Inventory">
                <div className="admin-product-stock">
                  <Package size={16} />

                  <span>
                    {product.stock} in stock
                  </span>
                </div>
              </td>

              <td data-label="Features">
                <div className="admin-product-features">
                  {product.isBestSeller ? (
                    <span>
                      <Star size={13} />
                      Best seller
                    </span>
                  ) : null}

                  {product.isOrganic ? (
                    <span>
                      <Leaf size={13} />
                      Organic
                    </span>
                  ) : null}

                  {product.isFeatured ? (
                    <span>Featured</span>
                  ) : null}

                  {!product.isBestSeller &&
                  !product.isOrganic &&
                  !product.isFeatured ? (
                    <small>Standard</small>
                  ) : null}
                </div>
              </td>

              <td data-label="Status">
                <span
                  className={`admin-product-status ${
                    product.isActive
                      ? "admin-product-status--active"
                      : "admin-product-status--inactive"
                  }`}
                >
                  {product.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td data-label="Actions">
                <div className="admin-product-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    type="button"
                    className="admin-product-delete-button"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;