import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API + "/api",
    credentials: "include",
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
    }),

    checkAuth: builder.query({
      query: () => "/users/me",
    }),

    getUsers: builder.query({
      query: () => "/users/users",
      providesTags: ["Users"],
    }),

    getUser: builder.query({
      query: (id) => `/users/user/${id}`,
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

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/users/resetPassword",
        method: "POST",
        body: data,
      }),
    }),

    bulkImportUsers: builder.mutation({
      query: (users) => ({
        url: "/users/bulk-write",
        method: "POST",
        body: { users },
      }),
    }),
  }),
});

export const {
  useBulkImportUsersMutation,
  useLoginUserMutation,
  useCheckAuthQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
} = userApi;