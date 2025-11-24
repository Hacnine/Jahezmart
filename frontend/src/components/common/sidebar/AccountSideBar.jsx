"use client";

import {
  Badge,
  BorderColor,
  Favorite,
  Logout,
  Payment,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../../store/slices/authSlice";
import { clearCart } from "../../../store/slices/cartSlice";
import { signOut, useSession } from "next-auth/react";
import { MdAccountTree } from "react-icons/md";
import { accountSidebar } from "../../../constant";

const AccountSideBar = () => {
  const link = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      // If signed in via next-auth, sign out there too
      if (session) {
        await signOut({ redirect: false });
      }

      // Clear client-side auth and cart state
      dispatch(logoutAction());
      dispatch(clearCart());

      // Redirect to signin page
      router.replace("/signin");
    } catch (err) {
      console.error("Logout failed", err);
      // fallback redirect
      router.replace("/signin");
    }
  };

  return (
    <div className="text-base font-sans md:px-0 px-6">
      <div className=" rounded-md shadow-md shadow-gray-300 md:w-fit hover:scale-105 transition-transform duration-500">
        <div
          className="p-4 bg-white  md:flex md:items-center  md:w-[233px] w-full gap-4  rounded-md 
       "
        >
          <div className="">
            <img
              src="/images/BeardManProfile.svg"
              className="rounded-full w-14 h-14 border   p-1 object-cover"
            />
          </div>

          <div className=" ">
            <p className="text-gray-800 font-medium text-sm">Abdullah</p>
          </div>
        </div>
      </div>

      {/* <!-- Account Profile End --> */}

      {/* <!-- Profile links --> */}
      <div className="bg-white md:w-fit w-full col-start-1 mt-6   rounded divide-y  text-gray-600 gap-4 mb-7 ">
        {" "}
        <div className="space-y-1  p-3  md:w-[233px] rounded-md  shadow-md shadow-gray-300 flex items-start mb-3 hover:scale-105 transition-transform duration-500">
          {" "}
          <div className={` space-y-2 text-gray-600`}>
            {accountSidebar.map((item, index) => (
              <button
                onClick={() => {
                  router.replace(item.link);
                }}
                className={`${
                  link === item.link ? "text-orangeRed" : "text-gray-600  "
                } start gap-2 block font-semibold capitalize hover:text-orangeRed  ${index===0? "text-base ml-0":"ml-7 text-sm"}`}
                key={index}
              >{index === 0? <span className="mt-1 ">
              <MdAccountTree  className=" text-xl hover:text-orangeRed cursor-pointer" />
            </span>: null}
                {item.label}
              </button>

              // <div className="pl-8">

              // </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 mt-3 p-2  rounded-md shadow-md shadow-gray-300 hover:scale-105 transition-transform duration-500">
          <button
            className={`${
              link === "/account/order/orderhistory"
                ? "text-orangeRed"
                : "text-gray-600  "
            } hover:text-orangeRed start gap-2 block capitalize font-semibold`}
            onClick={() => {
              router.replace("/account/order/orderhistory");
            }}
          >
            <span className="">
              <BorderColor />
            </span>
            Order History
          </button>

          <div className="pl-8">
            <button
              className={`${
                link === "/account/order/returns"
                  ? "text-orangeRed"
                  : "text-gray-600  "
              }   hover:text-orangeRed block  capitalize transition text-sm mb-1 `}
              onClick={() => {
                router.replace("/account/order/returns");
              }}
            >
              {" "}
              Returns
            </button>
          </div>
        </div>
        <div className="space-y-1  mt-3 p-2  rounded-md shadow-md shadow-gray-300  hover:scale-105 transition-transform duration-500">
          <button
            className={`${
              link === "/account/payment" ? "text-orangeRed" : "text-gray-600  "
            } start gap-2 block capitalize  font-semibold hover:text-orangeRed `}
            onClick={() => {
              router.replace("/account/payment");
            }}
          >
            <span className=" text-base">
              <Payment />
            </span>
            Payments Method
          </button>
          <button
            className={`${
              link === "/account/voucher" ? "text-orangeRed" : "text-gray-600  "
            }  pl-8 hover:text-orangeRed block  capitalize transition text-sm`}
            onClick={() => {
              router.replace("/account/voucher");
            }}
          >
            Voucher
          </button>
        </div>
          <button
            className={`${
              link === "/account/wishlist"
                ? "text-orangeRed"
                : "text-gray-600  "
            }  start gap-2 block font-medium capitalize hover:text-orangeRed hover:scale-105 transition-transform duration-500 space-y-1 mt-3 p-2  rounded-md shadow-md shadow-gray-300 w-full`}
            onClick={() => {
              router.replace("/account/wishlist");
            }}
          >
            <span className=" text-base font-semibold">
              <Favorite />
            </span>
            <p className="font-semibold"> Wish List</p>
          </button>
          <button
            className={`${
              link === "/account/signin" ? "text-orangeRed" : "text-gray-600  "
            } hover:text-orangeRed space-y-1  mt-3 p-2  rounded-md shadow-md shadow-gray-300 start  w-full hover:scale-105 transition-transform duration-500`}
            onClick={handleLogout}
          >
            <span className=" mr-2 text-base">
              <Logout />
            </span>
            Log Out
          </button>
      </div>
    </div>
  );
};

export default AccountSideBar;
