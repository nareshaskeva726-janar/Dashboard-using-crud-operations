// redux/userApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// API slice
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // include cookies
  }),
  tagTypes: ["Users"], // for invalidation
  endpoints: (builder) => ({
    // ---------- AUTH ----------
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
      
    }),
    checkAuth: builder.query({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
    }),

    // ---------- USERS ----------
    getUsers: builder.query({
      query: () => "/users/users",
      providesTags: ["Users"],
    }),


    getUser: builder.query({
      query: (id) => `/users/user/${id}`,
      providesTags: ["Users"],
    }),



    addUser: builder.mutation({
      query: (data) => ({
        url: "/users/addUser",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),



    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/updateUser/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),




    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/deleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    

    // ---------- PASSWORD ----------
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/users/resetPassword",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useLoginUserMutation,
  useCheckAuthQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
} = userApi;