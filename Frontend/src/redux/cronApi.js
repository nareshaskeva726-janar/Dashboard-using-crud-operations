import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cronApi = createApi({
  reducerPath: "cronApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include"
  }),
  tagTypes: ["Cron"],
  endpoints: (builder) => ({
    getCronNotify: builder.query({
      query: () => "/reminders",
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      providesTags: ["Cron"]
    }),

    markAllasRead: builder.mutation({
      query: () => ({
        url: "/reminders/mark-all",
        method: "PUT",
      })
    })
  })
});

export const { useGetCronNotifyQuery, useMarkAllasReadMutation } = cronApi;