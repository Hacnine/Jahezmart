"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "../../store/api";

const SummaryCard = ({ children, onPlaceOrder, isLoading = false }) => {
  const { cartProducts } = useSelector((state) => state.cart);
  const { data: cartItems = [] } = useGetCartQuery();

  const router = useRouter();

  const handleClick = () => {
    if (children === "Place Order" && onPlaceOrder) {
      onPlaceOrder();
    } else if (children === "Checkout") {
      router.push("/account/cart/checkout");
    } else {
      // Default behavior for other cases
    }
  };

  // Use RTK Query data if available, fallback to Redux
  const itemsToDisplay = cartItems.length > 0 ? cartItems : cartProducts;

  // Calculate totals
  const subtotal = itemsToDisplay.reduce((sum, product) =>
    sum + (product.quantity * product.price), 0
  );
  const shipping = 40; // Fixed shipping cost
  const total = subtotal + shipping;

  return (
    <div className="w-full max-w-[400px] space-y-4 shadow-lg rounded-lg p-6 text-sm font-sans bg-white">
      <p className="text-gray-800 text-lg font-semibold border-b pb-2">ORDER SUMMARY</p>

      {itemsToDisplay.length > 0 ? (
        <div className="space-y-3">
          {itemsToDisplay.map((product, index) => (
            <div className="flex justify-between items-center w-full" key={index}>
              <p
                className="text-sm font-medium text-gray-700 flex-1 mr-2"
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {product.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  x{product.quantity}
                </span>
                <span className="text-sm text-orangeRed font-semibold">
                  ${product.quantity * product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No items in cart</p>
      )}

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <p className="font-medium text-gray-700">Subtotal</p>
          <span className="font-medium text-gray-700">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <p className="font-medium text-gray-700">Shipping</p>
          <span className="font-medium text-gray-700">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <p className="font-semibold text-gray-800 text-base">Total</p>
          <span className="font-semibold text-gray-800 text-base">${total.toFixed(2)}</span>
        </div>
      </div>

      {children === "Place Order" && (
        <div className="flex items-center justify-start space-x-2 pt-2">
          <input
            type="checkbox"
            name="checkbox"
            className="text-orangeRed rounded focus:ring-0 cursor-pointer"
            id="terms"
            required
          />
          <label htmlFor="terms" className="text-gray-600 text-sm">
            I agree to the{" "}
            <span className="text-orangeRed cursor-pointer">terms and conditions</span>
          </label>
        </div>
      )}

      <button
        type="button"
        className="block text-center bg-orangeRed w-full rounded-md text-white h-12 ring-1 hover:bg-transparent hover:text-orangeRed ring-orangeRed mt-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleClick}
        disabled={isLoading || itemsToDisplay.length === 0}
      >
        {isLoading ? "Processing..." : children}
      </button>
    </div>
  );
};

export default SummaryCard;
