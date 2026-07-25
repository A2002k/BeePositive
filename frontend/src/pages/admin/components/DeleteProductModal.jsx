import {
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

function DeleteProductModal({
  product,
  isDeleting,
  onClose,
  onConfirm,
}) {
  return (
    <div
      className="admin-product-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isDeleting
        ) {
          onClose();
        }
      }}
    >
      <section
        className="admin-product-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
      >
        <button
          type="button"
          className="admin-product-delete-close"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close delete confirmation"
        >
          <X size={19} />
        </button>

        <span className="admin-product-delete-icon">
          <Trash2 size={28} />
        </span>

        <h2 id="delete-product-title">
          Delete product?
        </h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{product.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="admin-product-delete-actions">
          <button
            type="button"
            className="admin-product-cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-product-confirm-delete-button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle
                size={18}
                className="admin-products-spinner"
              />
            ) : (
              <Trash2 size={18} />
            )}

            {isDeleting
              ? "Deleting..."
              : "Delete product"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeleteProductModal;