import {
  ImagePlus,
  LoaderCircle,
  Package,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  category: "",
  price: "",
  weight: "",
  weightUnit: "g",
  stock: "0",
  isBestSeller: false,
  isFeatured: false,
  isOrganic: false,
  isActive: true,
};

const createSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getExistingImage = (product) => {
  const imageUrl = product?.images?.[0]?.url;

  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${BACKEND_URL}${imageUrl}`;
};

function ProductFormModal({
  product,
  isSaving,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(product?._id);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description:
          product.description || "",
        category: product.category || "",
        price:
          product.price !== undefined
            ? String(product.price)
            : "",
        weight:
          product.weight !== null &&
          product.weight !== undefined
            ? String(product.weight)
            : "",
        weightUnit:
          product.weightUnit || "g",
        stock:
          product.stock !== undefined
            ? String(product.stock)
            : "0",
        isBestSeller: Boolean(
          product.isBestSeller
        ),
        isFeatured: Boolean(
          product.isFeatured
        ),
        isOrganic: Boolean(
          product.isOrganic
        ),
        isActive:
          product.isActive !== false,
      });

      setImagePreview(
        getExistingImage(product)
      );
    } else {
      setForm(INITIAL_FORM);
      setImagePreview("");
    }

    setImageFile(null);
    setFormError("");
  }, [product]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !isSaving
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [isSaving, onClose]);

  useEffect(() => {
    return () => {
      if (
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  const modalTitle = useMemo(
    () =>
      isEditing
        ? "Edit product"
        : "Add new product",
    [isEditing]
  );

  const handleInputChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm((currentForm) => ({
      ...currentForm,
      name: value,
      slug:
        !isEditing ||
        currentForm.slug ===
          createSlug(currentForm.name)
          ? createSlug(value)
          : currentForm.slug,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.type.startsWith(
        "image/"
      )
    ) {
      setFormError(
        "Please select a valid image file."
      );

      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setFormError(
        "The image must be smaller than 5 MB."
      );

      return;
    }

    if (
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(selectedFile);
    setImagePreview(
      URL.createObjectURL(
        selectedFile
      )
    );
    setFormError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      return "Enter a valid product price.";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      return "Enter a valid stock quantity.";
    }

    if (
      form.weight !== "" &&
      Number(form.weight) < 0
    ) {
      return "Weight cannot be negative.";
    }

    if (
      !isEditing &&
      !imageFile
    ) {
      return "A product image is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setFormError("");

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "slug",
        form.slug.trim() ||
          createSlug(form.name)
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "category",
        form.category.trim()
      );

      formData.append(
        "price",
        String(Number(form.price))
      );

      formData.append(
        "weight",
        form.weight
      );

      formData.append(
        "weightUnit",
        form.weightUnit
      );

      formData.append(
        "stock",
        String(Number(form.stock))
      );

      formData.append(
        "isBestSeller",
        String(form.isBestSeller)
      );

      formData.append(
        "isFeatured",
        String(form.isFeatured)
      );

      formData.append(
        "isOrganic",
        String(form.isOrganic)
      );

      formData.append(
        "isActive",
        String(form.isActive)
      );

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      await onSave(
        formData,
        product?._id
      );
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to save the product."
      );
    }
  };

  return (
    <div
      className="admin-product-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }
      }}
    >
      <section
        className="admin-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <header className="admin-product-modal-header">
          <div>
            <span>
              Product catalogue
            </span>

            <h2 id="product-form-title">
              {modalTitle}
            </h2>

            <p>
              Manage product information,
              inventory and visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close product form"
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <div className="admin-product-form-error">
              {formError}
            </div>
          ) : null}

          <div className="admin-product-form-layout">
            <div className="admin-product-form-main">
              <section className="admin-product-form-card">
                <div className="admin-product-form-card-heading">
                  <Package size={19} />

                  <div>
                    <h3>
                      Product information
                    </h3>

                    <p>
                      Main details shown to
                      customers.
                    </p>
                  </div>
                </div>

                <div className="admin-product-form-grid">
                  <label className="admin-product-field admin-product-field--full">
                    <span>
                      Product name
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={
                        handleNameChange
                      }
                      placeholder="Example: Wildflower Honey"
                      maxLength={150}
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Slug</span>

                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={
                        handleInputChange
                      }
                      placeholder="wildflower-honey"
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Category</span>

                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Honey"
                    />
                  </label>

                  <label className="admin-product-field admin-product-field--full">
                    <span>Description</span>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Describe the product..."
                      rows={5}
                      maxLength={2000}
                    />

                    <small>
                      {
                        form.description
                          .length
                      }
                      /2000 characters
                    </small>
                  </label>
                </div>
              </section>

              <section className="admin-product-form-card">
                <div className="admin-product-form-card-heading">
                  <Package size={19} />

                  <div>
                    <h3>
                      Pricing and inventory
                    </h3>

                    <p>
                      Set price, weight and
                      available quantity.
                    </p>
                  </div>
                </div>

                <div className="admin-product-form-grid">
                  <label className="admin-product-field">
                    <span>Price ($)</span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={
                        handleInputChange
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Stock</span>

                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={
                        handleInputChange
                      }
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Weight</span>

                    <input
                      type="number"
                      name="weight"
                      value={form.weight}
                      onChange={
                        handleInputChange
                      }
                      placeholder="500"
                      min="0"
                      step="0.01"
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Weight unit</span>

                    <select
                      name="weightUnit"
                      value={
                        form.weightUnit
                      }
                      onChange={
                        handleInputChange
                      }
                    >
                      <option value="g">
                        g
                      </option>

                      <option value="kg">
                        kg
                      </option>

                      <option value="ml">
                        ml
                      </option>

                      <option value="L">
                        L
                      </option>

                      <option value="piece">
                        piece
                      </option>
                    </select>
                  </label>
                </div>
              </section>
            </div>

            <aside className="admin-product-form-sidebar">
              <section className="admin-product-form-card">
                <div className="admin-product-form-card-heading">
                  <ImagePlus size={19} />

                  <div>
                    <h3>Product image</h3>

                    <p>
                      Recommended square image.
                    </p>
                  </div>
                </div>

                <label className="admin-product-image-upload">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                    />
                  ) : (
                    <div>
                      <ImagePlus
                        size={32}
                      />

                      <strong>
                        Upload an image
                      </strong>

                      <span>
                        PNG, JPG or WEBP
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageChange
                    }
                  />
                </label>

                <small className="admin-product-image-note">
                  Maximum file size: 5 MB
                </small>
              </section>

              <section className="admin-product-form-card">
                <div className="admin-product-form-card-heading">
                  <Package size={19} />

                  <div>
                    <h3>
                      Product settings
                    </h3>

                    <p>
                      Choose how this product
                      appears.
                    </p>
                  </div>
                </div>

                <div className="admin-product-switches">
                  <label>
                    <div>
                      <strong>
                        Active
                      </strong>

                      <span>
                        Visible to customers
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        form.isActive
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </label>

                  <label>
                    <div>
                      <strong>
                        Featured
                      </strong>

                      <span>
                        Show in featured sections
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={
                        form.isFeatured
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </label>

                  <label>
                    <div>
                      <strong>
                        Best seller
                      </strong>

                      <span>
                        Display best-seller badge
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={
                        form.isBestSeller
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </label>

                  <label>
                    <div>
                      <strong>
                        Organic
                      </strong>

                      <span>
                        Display organic badge
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="isOrganic"
                      checked={
                        form.isOrganic
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </label>
                </div>
              </section>
            </aside>
          </div>

          <footer className="admin-product-form-footer">
            <button
              type="button"
              className="admin-product-cancel-button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-product-save-button"
              disabled={isSaving}
            >
              {isSaving ? (
                <LoaderCircle
                  size={18}
                  className="admin-products-spinner"
                />
              ) : (
                <Save size={18} />
              )}

              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create product"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ProductFormModal;