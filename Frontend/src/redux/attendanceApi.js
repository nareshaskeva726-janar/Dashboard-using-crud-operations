import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API+"/api/attendance",
    credentials: "include",
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({

    // ---------------- MARK ATTENDANCE ----------------
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/mark-attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ---------------- UPDATE ATTENDANCE ----------------
    updateAttendance: builder.mutation({
      query: (data) => ({
        url: `/update-attendance/${attendanceId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ---------------- DELETE ATTENDANCE ----------------
    deleteAttendance: builder.mutation({
      query: (attendanceId) => ({
        url: `/delete-attendance/${attendanceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ---------------- SUPERADMIN ALL ATTENDANCE ----------------
    getAllAttendance: builder.query({
      query: (params) => ({
        url: "/all-attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // ---------------- STAFF ATTENDANCE ----------------
    getStaffAttendance: builder.query({
      query: (params) => ({
        url: "/staff-attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // ---------------- ADMIN ATTENDANCE (HOD) ----------------
    getAdminAttendance: builder.query({
      query: (params) => ({
        url: "/admin-attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // ---------------- STUDENT MY ATTENDANCE ----------------
    getMyAttendance: builder.query({
      query: (params) => ({
        url: "/my-attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // ---------------- MONTHLY SUMMARY (ALL ROLES) ----------------
    getMonthlySummary: builder.query({
      query: (params) => ({
        url: "/monthly-summary",
        params,
      }),
      providesTags: ["Attendance"],
    }),

  }),
});

export const {
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAllAttendanceQuery,
  useGetStaffAttendanceQuery,
  useGetAdminAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetMonthlySummaryQuery,
} = attendanceApi;