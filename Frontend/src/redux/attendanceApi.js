import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/attendance",
    credentials: "include",
  }),

  tagTypes: ["Attendance", "Summary"],

  endpoints: (builder) => ({

    /* =========================================
       MARK ATTENDANCE (STAFF)
    ========================================= */
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/mark",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Summary"],
    }),

    /* =========================================
       UPDATE ATTENDANCE
    ========================================= */
    updateAttendance: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Attendance", "Summary"],
    }),

    /* =========================================
       DELETE ATTENDANCE
    ========================================= */
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance", "Summary"],
    }),

    /* =========================================
       GET ALL ATTENDANCE
    ========================================= */
    getAllAttendance: builder.query({
      query: () => "/",
      providesTags: ["Attendance"],
    }),

    /* =========================================
       STUDENT → MY ATTENDANCE
    ========================================= */
    getMyAttendance: builder.query({
      query: (params) => ({
        url: "/my",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    /* =========================================
       MONTHLY SUMMARY
    ========================================= */
    getMonthlySummary: builder.query({
      query: ({ month, year }) => ({
        url: "/summary",
        params: { month, year },
      }),
      providesTags: ["Summary"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAllAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetMonthlySummaryQuery,
} = attendanceApi;