import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

//here i created a query for createApi and with reducerPath
export const userApi = createApi({
  reducerPath: "userApi",


  //basequery fetchbasequery is the principle function to the backend url
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include"
  }),


  //tagtypes
  tagTypes: ["Users"],


  //api ends from backend to frontend 
  endpoints: (builder) => ({ //here builder is the creator pass as a argument to work

    // REGISTER 
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),


    // LOGIN
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/resetPassword",
        method: "POST",
        body: data,
      }),
    }),

    //Invalidtages only for post, put, delete *optional*

    // GET ALL USERS
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"], // provides tags only for getApi
    }),


    // GET SINGLE USER
    getUser: builder.query({
      query: (id) => `/user/${id}`, // provides tags only for getApi
      method : "GET"
    }),

    checkAuth: builder.query({
      query: () => "/me",
      method : "GET"
    }),



    // ADD USER
    addUser: builder.mutation({
      query: (data) => ({
        url: "/addUser",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"], //Invalidtages only for post, 
    }),

    // UPDATE USER
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/updateUser/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"], //Invalidtages only for put becase we want to re render the function
    }),

    
    // DELETE USER
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/deleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"], //Invalidtages only for post, put, delete because we want to rerender the funcation after deletion
    }),

  }),
});


//destructed Hooks for the use
export const {

  //AUTH
  useRegisterUserMutation,
  useLoginUserMutation,
  useResetPasswordMutation,

  //GET ALL USERS
  useGetUsersQuery,
  useGetUserQuery,

  //CRUD
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,


  useCheckAuthQuery
} = userApi;


