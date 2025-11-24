"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Products", "Product", "Auth", "Users", "Orders", "Cart", "Wishlist"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: { ...credentials, role: 'admin' },
      }),
    }),

    // Products endpoints
    getProducts: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            qs.set(k, String(v));
          }
        });
        const query = qs.toString();
        return `/products${query ? `?${query}` : ""}`;
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "Product", id: p.id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Products management (admin only)
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: productData,
      }),
      invalidatesTags: ["Products", "Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "Product"],
    }),

    // Users management (admin only)
    getUsers: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            qs.set(k, String(v));
          }
        });
        const query = qs.toString();
        return `/users${query ? `?${query}` : ""}`;
      },
      providesTags: ["Users"],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Orders management (admin only)
    getOrders: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            qs.set(k, String(v));
          }
        });
        const query = qs.toString();
        return `/orders${query ? `?${query}` : ""}`;
      },
      providesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Profile management
    getProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/auth/profile",
        method: "PATCH",
        body: profileData,
      }),
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/auth/change-password",
        method: "POST",
        body: passwordData,
      }),
    }),

    // User orders
    getUserOrders: builder.query({
      query: () => "/auth/orders",
      providesTags: ["UserOrders"],
    }),
    getUserOrder: builder.query({
      query: (orderId) => `/auth/orders/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: "UserOrder", id: orderId }],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...orderData }) => ({
        url: `/auth/orders/${id}`,
        method: "PATCH",
        body: orderData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "UserOrder", id },
        "UserOrders"
      ],
    }),

    // User cart
    getCart: builder.query({
      query: () => "/auth/cart",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: "/auth/cart",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auth/cart/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/auth/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // User wishlist
    getWishlist: builder.query({
      query: () => "/auth/wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: (item) => ({
        url: "/auth/wishlist",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: builder.mutation({
      query: (id) => ({
        url: `/auth/wishlist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Payment endpoints
    createCheckoutSession: builder.mutation({
      query: (checkoutData) => ({
        url: "/payment/create-checkout-session",
        method: "POST",
        body: checkoutData,
      }),
    }),
    getSessionDetails: builder.query({
      query: (sessionId) => `/payment/session-details?session_id=${sessionId}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useAdminLoginMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserOrdersQuery,
  useGetUserOrderQuery,
  useUpdateOrderMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveWishlistItemMutation,
  useCreateCheckoutSessionMutation,
  useGetSessionDetailsQuery,
} = api;
