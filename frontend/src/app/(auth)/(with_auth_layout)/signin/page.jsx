"use client";

import { Checkbox, FormControlLabel} from "@mui/material";
import React, { useState } from "react";
import Link from "next/link";
import { useLoginMutation } from "../../../../store/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../../store/slices/authSlice";

const SignIn = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();
      
      dispatch(setCredentials(result));
      // Redirect based on user role
      if (result.user?.role === 'admin') {
        // Set admin-specific localStorage for AdminGuard
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('userRole', 'admin');
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleOAuthSignIn = (provider) => {
    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  return (
    <div className="container mx-auto text-sm  px-6 py-3 rounded-md w-full gap-4">
      {/* <h2 className="text-lg  font-base text-center mb-1 text-orangeRed">
        SIGN IN{" "}
      </h2> */}

      <div className=" center md:flex-row flex-col gap-4 md:shadow-none shadow-xl p-5">
      <form onSubmit={handleSubmit} className=" w-full md:w-[50%] lg:w-[40%]">
        <div className="space-y-6 w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error?.data?.message || "Login failed. Please try again."}
            </div>
          )}
          
          <div className="w-full">
            <label htmlFor="email" className="text-gray-600 mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input placeholder:text-xs"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="">
            <label htmlFor="password" className="text-gray-600 mb-2 block">
              Password
            </label>
            <input
              type="password"
              className=" input placeholder:text-xs"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className=" space-x-2">
              <FormControlLabel
                label={<p className="text-sm">Remember Me</p>}
                control={
                  <Checkbox
                    sx={{
                      color: "red",
                      "&.Mui-checked": {
                        color: "red",
                      },
                    }}
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disableRipple
                    inputProps={{ "aria-label": "Checkbox demo" }}
                    size="small"
                  />
                }
              />
            </div>

            <Link href="/forgot-password" className="text-red-600">
              Forget password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className=" block text-center bg-orangeRed w-full rounded-md text-white h-10  ring-1 hover:bg-transparent hover:text-orangeRed ring-orangeRed mt-6 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>

        <div className=" w-full mt-5 space-y-5">
      <div className=" flex justify-center relative">
        <div className="text-gray-600 text center uppercase px-3 bg-gray-200 z-10 ">
          OR LOG IN WITH
        </div>
        <div className="absolute left-0 top-3 w-full border-b-2 border-gray-200"></div>
      </div>

      <div className="flex  gap-4">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("github")}
          className="w-1/2 py-2 text-center text-white bg-gray-800 rounded-md uppercase font-roboto font-medium text-sm hover:bg-gray-700"
        >
          GitHub
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          className="w-1/2 py-2 text-center text-white bg-red-500 rounded-md uppercase font-roboto font-medium text-sm hover:bg-red-400"
        >
          Google
        </button>
      </div>
      <p className=" text-gray-600 text-center">
        Don't have an Account?
        <Link href="/signup" className="text-red-600">
          {" "}
          Sign Up Now!
        </Link>
      </p>
      </div>
      </form>

      
      </div>
    </div>
  );
};

export default SignIn;
