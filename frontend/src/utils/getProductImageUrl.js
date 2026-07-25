const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

export const getProductImageUrl = (product) => {
  const image =
    product?.images?.[0]?.url ||
    product?.image ||
    "";

  if (!image) {
    return "/assets/images/product-placeholder.png";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const normalizedImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (normalizedImage.startsWith("uploads/")) {
    return `${BACKEND_URL}/${normalizedImage}`;
  }

  return `${BACKEND_URL}/uploads/${normalizedImage}`;
};

export const productImageFallback =
  "/assets/images/product-placeholder.png";