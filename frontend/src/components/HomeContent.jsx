import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Droplets,
  Hexagon,
  Package,
  Play,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  getProductImageUrl,
  productImageFallback,
} from "../utils/getProductImageUrl";
import { Link } from "react-router-dom";
import { socket } from "../socket";
import { useCart } from "../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const steps = [
  {
    icon: Hexagon,
    title: "1. Harvesting",
    text: "We harvest the honey carefully from our beehives.",
  },
  {
    icon: SlidersHorizontal,
    title: "2. Extracting",
    text: "Pure honey is extracted naturally from the honeycomb.",
  },
  {
    icon: Droplets,
    title: "3. Filtering",
    text: "The natural goodness and rich flavor are preserved.",
  },
  {
    icon: Package,
    title: "4. Packaging",
    text: "Every jar is carefully packed and prepared for delivery.",
  },
];

function HomeContent() {
  const { addToCart } = useCart();

  const [isVideoOpen, setIsVideoOpen] =
    useState(false);

  const [products, setProducts] = useState([]);

  const [isLoadingProducts, setIsLoadingProducts] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  const [addedProductId, setAddedProductId] =
    useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isVideoOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVideoOpen]);



  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError("");

      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load bestselling products."
        );
      }

      const receivedProducts = Array.isArray(data)
        ? data
        : data.products || [];

      const bestSellers = receivedProducts.filter(
        (product) =>
          product.bestSeller === true ||
          product.bestSeller === "true" ||
          product.isBestSeller === true ||
          product.isBestSeller === "true"
      );

      setProducts(bestSellers.slice(0, 4));
    } catch (error) {
      console.error(
        "Homepage bestsellers error:",
        error
      );

      setProducts([]);
      setProductsError(
        error.message ||
          "Unable to load bestselling products."
      );
    } finally {
      setIsLoadingProducts(false);
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

  const openVideo = () => {
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
  };

  const handleAddToCart = (product) => {
    if (Number(product.stock ?? 0) <= 0) {
      return;
    }

    addToCart(product);

    setAddedProductId(product._id);

    window.setTimeout(() => {
      setAddedProductId((currentId) =>
        currentId === product._id
          ? ""
          : currentId
      );
    }, 1200);
  };

  return (
    <>
      <section
        id="products"
        className="bg-[#0b0907] px-5 pb-20 pt-10 text-white lg:px-12"
      >
        <div className="mx-auto grid max-w-[1500px] gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 flex items-end justify-between gap-5">
              <div>
                <h2 className="font-serif text-3xl font-bold">
                  Our Bestsellers
                </h2>

                <div className="mt-2 h-[2px] w-8 bg-amber-500" />
              </div>

              <Link
                to="/products"
                className="flex shrink-0 items-center gap-2 text-sm font-medium text-amber-400 transition hover:text-amber-300"
              >
                View All Products
                <ArrowRight size={16} />
              </Link>
            </div>

            {isLoadingProducts && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[330px] animate-pulse rounded-xl border border-white/10 bg-[#16110c]"
                  />
                ))}
              </div>
            )}

            {productsError && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-300">
                {productsError}
              </div>
            )}

            {!isLoadingProducts &&
              !productsError &&
              products.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#16110c] p-8 text-center text-white/60">
                  No best-selling products are
                  available yet.
                </div>
              )}

            {!isLoadingProducts &&
              !productsError &&
              products.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product) => {
                   const productImage =getProductImageUrl(product);

                    const productAlt =
                      product.images?.[0]?.alt ||
                      product.name;

                    const isAdded =
                      addedProductId ===
                      product._id;

                    const productStock = Number(
                      product.stock ?? 0
                    );

                    const isOutOfStock =
                      productStock <= 0;

                    const isLowStock =
                      productStock > 0 &&
                      productStock <= 5;

                    return (
                      <article
                        key={product._id}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-[#16110c] transition duration-300 hover:-translate-y-2 hover:border-amber-400/60 hover:shadow-[0_15px_45px_rgba(245,158,11,0.18)]"
                      >
                        <div className="relative flex h-[230px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#1c1712] to-[#100d0a] px-4 py-5">
                          <div className="absolute bottom-4 left-1/2 h-10 w-32 -translate-x-1/2 rounded-full bg-amber-500/10 blur-xl" />

                        <img src={productImage} alt={productAlt} loading="lazy" onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              productImageFallback;
                          }}
                          className="relative z-10 h-[88%] w-full object-contain transition duration-500 group-hover:scale-105"
                        />
                        </div>

                        <div className="flex items-end justify-between gap-3 p-4">
                          <div>
                            <h3 className="text-sm font-semibold">
                              {product.name}
                            </h3>

                            <div
                              className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                                isOutOfStock
                                  ? "text-red-400"
                                  : isLowStock
                                  ? "text-amber-400"
                                  : "text-green-400"
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />

                              {isOutOfStock
                                ? "Out of Stock"
                                : isLowStock
                                ? `Only ${productStock} left`
                                : "In Stock"}
                            </div>

                            <p className="mt-1 text-base font-bold text-white">
                              $
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </p>

                            {product.weight && (
                              <p className="mt-1 text-xs text-white/50">
                                {product.weight}{" "}
                                {product.weightUnit}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                            aria-label={
                              isOutOfStock
                                ? `${product.name} is out of stock`
                                : `Add ${product.name} to cart`
                            }
                            title={
                              isOutOfStock
                                ? "Out of stock"
                                : isAdded
                                ? "Added to cart"
                                : "Add to cart"
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black shadow-lg transition duration-300 ${
                              isOutOfStock
                                ? "cursor-not-allowed bg-gray-500 opacity-50"
                                : isAdded
                                ? "scale-110 bg-green-400 shadow-green-500/20"
                                : "bg-amber-500 shadow-amber-500/20 hover:scale-105 hover:bg-amber-400"
                            }`}
                          >
                            {isAdded ? (
                              <Check size={19} />
                            ) : (
                              <ShoppingCart
                                size={18}
                              />
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
          </div>

          <div id="process" className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#16110c] p-5 shadow-2xl shadow-black/30 lg:p-7">
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400">
                  From Hive to Jar
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
                  The Natural Process
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/60">
                  Discover how our honey travels
                  from the beehive to the jar while
                  preserving its natural taste,
                  quality and goodness.
                </p>

                <button
                  type="button"
                  onClick={openVideo}
                  className="group mt-6 flex w-fit items-center gap-3 rounded-lg border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-400 transition duration-300 hover:-translate-y-1 hover:bg-amber-500 hover:text-black"
                >
                  Watch Video

                  <Play
                    size={16}
                    fill="currentColor"
                    className="transition group-hover:scale-110"
                  />
                </button>
              </div>

              <div
                onClick={openVideo}
                className="group relative min-h-[190px] cursor-pointer overflow-hidden rounded-xl border border-white/10"
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                >
                  <source
                    src="/assets/videos/VIDEO-2026-07-17-23-20-49.mp4"
                    type="video/mp4"
                  />
                </video>

                <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/20" />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openVideo();
                  }}
                  aria-label="Open honey production video"
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-xl backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-amber-400 hover:bg-amber-500 hover:text-black"
                >
                  <Play
                    size={25}
                    fill="currentColor"
                  />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="group"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/70 bg-amber-500/5 text-amber-400 transition duration-300 group-hover:bg-amber-500 group-hover:text-black">
                      <Icon
                        size={22}
                        strokeWidth={1.7}
                      />
                    </div>

                    <h3 className="text-sm font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

            <section
        id="story"
        className="scroll-mt-24 bg-[#100d0a] px-5 py-24 text-white lg:px-12"
      >
        <div className="mx-auto grid max-w-[1300px] items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
              Our Story
            </p>

            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Honey made with care,
              <span className="block text-amber-400">
                from hive to home.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/65">
              BeePositive was created from a passion for
              beekeeping, nature and authentic Lebanese honey.
              We carefully harvest our honey while respecting
              the bees and preserving its natural taste,
              quality and goodness.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
              Every jar represents our commitment to natural
              production, careful preparation and delivering
              trusted honey directly to families across
              Lebanon.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-amber-500 px-7 py-4 font-semibold text-black transition hover:-translate-y-1 hover:bg-amber-400"
            >
              Explore Our Honey
              <ArrowRight size={19} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#18120d] p-8 shadow-2xl shadow-black/40">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Hexagon
                  size={30}
                  className="text-amber-400"
                />

                <h3 className="mt-5 text-lg font-semibold">
                  Carefully Harvested
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Honey is collected carefully from healthy
                  beehives.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Droplets
                  size={30}
                  className="text-amber-400"
                />

                <h3 className="mt-5 text-lg font-semibold">
                  Naturally Preserved
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Its natural flavor, texture and goodness are
                  maintained.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:col-span-2">
                <Package
                  size={30}
                  className="text-amber-400"
                />

                <h3 className="mt-5 text-lg font-semibold">
                  Prepared for Your Family
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Each jar is packed with care and delivered
                  directly to customers across Lebanon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 bg-[#0b0907] px-5 py-24 text-white lg:px-12"
      >
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#1a130c] to-[#100c08] shadow-2xl shadow-black/40">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
                Contact Us
              </p>

              <h2 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">
                Have a question about our honey?
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-white/60">
                Contact BeePositive for product questions,
                orders, delivery information or partnership
                opportunities.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 rounded-lg bg-amber-500 px-7 py-4 font-semibold text-black transition hover:-translate-y-1 hover:bg-amber-400"
                >
                  Shop Products
                  <ShoppingCart size={19} />
                </Link>

                <a
                  href="mailto:karamzanthony2002@gmail.com"
                  className="inline-flex items-center gap-3 rounded-lg border border-white/20 px-7 py-4 font-semibold text-white transition hover:border-amber-400 hover:text-amber-400"
                >
                  Send an Email
                </a>
              </div>
            </div>

            <div className="flex items-center bg-amber-500 p-8 text-black sm:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em]">
                  BeePositive
                </p>

                <h3 className="mt-4 font-serif text-3xl font-bold">
                  Natural honey delivered across Lebanon.
                </h3>

                <p className="mt-5 leading-7 text-black/70">
                  Follow our journey and discover honey made
                  naturally from our beehives to your home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Honey production video"
          onClick={closeVideo}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-md"
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#100d0a] shadow-[0_30px_100px_rgba(0,0,0,0.75)]"
          >
            <button
              type="button"
              onClick={closeVideo}
              aria-label="Close video"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white backdrop-blur-md transition hover:rotate-90 hover:border-amber-400 hover:bg-amber-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <div className="aspect-video w-full bg-black">
              <video
                autoPlay
                controls
                playsInline
                className="h-full w-full object-contain"
              >
                <source
                  src="/assets/videos/VIDEO-2026-07-17-23-20-49.mp4"
                  type="video/mp4"
                />

                Your browser does not support the
                video element.
              </video>
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                From Hive to Jar
              </p>

              <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                The BeePositive Honey Process
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                See how our honey is harvested,
                extracted, filtered and prepared
                for every BeePositive jar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomeContent;