"use client";

import React from "react";
import Box from "@mui/material/Box";
import Scrollbars from "react-custom-scrollbars-2";
import CartCard from "../../card/CartCard";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "../../../store/api";

const CartItems = ({ width, height, large }) => {
  const { cartProducts } = useSelector((state) => state.cart);
  const { data: cartItems = [], isLoading } = useGetCartQuery();

  // Use RTK Query data if available, fallback to Redux
  const itemsToDisplay = cartItems.length > 0 ? cartItems : cartProducts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangeRed"></div>
      </div>
    );
  }

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: "16px",
          backgroundImage: `url('${
            large ? "/images/background/largecart.svg" : "/images/cart-bg.svg"
          }')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          "& a": {
            textDecoration: "none",
            marginBottom: "8px",
            width: width,
            color: "#aa4400",
            fontWeight: 600,
          },
        }}
      >
        <Scrollbars style={{ width: width, height: height }}>
          {itemsToDisplay && itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((product) => (
              <div className="start gap-3 backdrop-blur-sm bg-white/30 my-1 shadow" key={product.id}>
                <CartCard {...product} large={large} />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>Your cart is empty</p>
              <p className="text-sm mt-2">Add some products to get started!</p>
            </div>
          )}
        </Scrollbars>
      </Box>
    </div>
  );
};

export default CartItems;
