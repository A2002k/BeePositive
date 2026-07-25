import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { socket } from "../socket";

const CartContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(
    () => {
      try {
        const savedCart =
          localStorage.getItem("cartItems");

        return savedCart
          ? JSON.parse(savedCart)
          : [];
      } catch (error) {
        console.error(
          "Failed to read cart:",
          error
        );

        return [];
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(
      "cartItems",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  useEffect(() => {
    const synchronizeCartStock = async (
      payload = {}
    ) => {
      try {
        const response = await fetch(
          `${API_URL}/products`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to synchronize cart stock."
          );
        }

        const latestProducts =
          data.products || [];

        const latestProductsMap = new Map(
          latestProducts.map((product) => [
            String(product._id),
            product,
          ])
        );

        const affectedProductIds = new Set(
          (payload.productIds || []).map(
            (productId) => String(productId)
          )
        );

        setCartItems((currentItems) =>
          currentItems
            .map((item) => {
              const itemId = String(item._id);

              if (
                affectedProductIds.size > 0 &&
                !affectedProductIds.has(itemId)
              ) {
                return item;
              }

              const latestProduct =
                latestProductsMap.get(itemId);

              // Product was deleted or made unavailable
              if (!latestProduct) {
                return null;
              }

              const latestStock = Math.max(
                0,
                Number(latestProduct.stock || 0)
              );

              // Remove products that are now out of stock
              if (latestStock <= 0) {
                return null;
              }

              return {
                ...item,
                ...latestProduct,
                quantity: Math.min(
                  Number(item.quantity || 1),
                  latestStock
                ),
              };
            })
            .filter(Boolean)
        );
      } catch (error) {
        console.error(
          "Cart stock synchronization error:",
          error
        );
      }
    };

    socket.on(
      "stock-updated",
      synchronizeCartStock
    );

    return () => {
      socket.off(
        "stock-updated",
        synchronizeCartStock
      );
    };
  }, []);

  const addToCart = (product) => {
    const availableStock = Math.max(
      0,
      Number(product.stock || 0)
    );

    if (availableStock <= 0) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            String(item._id) ===
            String(product._id)
        );

      if (existingItem) {
        return currentItems.map((item) =>
          String(item._id) ===
          String(product._id)
            ? {
                ...item,
                ...product,
                quantity: Math.min(
                  Number(item.quantity || 0) +
                    1,
                  availableStock
                ),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (
          String(item._id) !==
          String(productId)
        ) {
          return item;
        }

        const maximumStock = Math.max(
          0,
          Number(item.stock || 0)
        );

        return {
          ...item,
          quantity: Math.min(
            Number(item.quantity || 0) + 1,
            maximumStock
          ),
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item._id) ===
          String(productId)
            ? {
                ...item,
                quantity:
                  Number(item.quantity) - 1,
              }
            : item
        )
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          String(item._id) !==
          String(productId)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}