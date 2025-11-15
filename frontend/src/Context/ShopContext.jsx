import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const backendUrl = "http://localhost:4000/api";
  const [all_product, setAll_Product] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    setLoading(true);
    fetch(`${backendUrl}/products/all-products`)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        // Make sure we're setting an array, not undefined
        if (data.success && Array.isArray(data.products)) {
          setAll_Product(data.products);
        } else {
          console.error("Invalid products data:", data);
          setAll_Product([]); // Always set to array, never undefined
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setAll_Product([]); // Set empty array on error too
      })
      .finally(() => {
        setLoading(false);
        if(localStorage.getItem("authToken")){
          fetch("http://localhost:4000/getcart", {
            method: "POST",
            headers: {
              Accept: "application/form-data",
              "Content-Type": "application/json",
              authToken: `${localStorage.getItem("authToken")}`,
            },
            body: "",
          }).then((res) => res.json())
            .then((data) => setCartItems(data))
            .catch((error) => console.error("Error fetching cart data:", error));
        }
      });
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("authToken")) {
      fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/form-data",
          "Content-Type": "application/json",
          authToken: `${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Add to cart response:", data);
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
        });
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem("authToken")) {
      fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/form-data",
          "Content-Type": "application/json",
          authToken: `${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Remove from cart response:", data);
        })
        .catch((error) => {
          console.error("Error removing from cart:", error);
        });
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        // ✅ ADD: Safety check in case product isn't found
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    loading,
    cartItems,
    addToCart,
    all_product,
    removeFromCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
