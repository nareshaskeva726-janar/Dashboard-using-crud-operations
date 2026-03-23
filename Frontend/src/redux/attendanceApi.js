import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // 🔥 important for cookies
  }),

  tagTypes: ["Attendance"],

  endpoints: (builder) => ({
    
    // ✅ 1. Mark Attendance (Staff)
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendance/mark",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ 2. Get Logged-in Student Attendance
    getMyAttendance: builder.query({
      query: () => "/attendance/my",
      providesTags: ["Attendance"],
    }),

    // ✅ 3. Get Attendance by Date + Subject (Staff)
    getAttendanceByDateSubject: builder.query({
      query: ({ date, subject }) =>
        `/attendance?date=${date}&subject=${subject}`,
      providesTags: ["Attendance"],
    }),

    // ✅ 4. Update Attendance
    updateAttendance: builder.mutation({
      query: ({ id, students }) => ({
        url: `/attendance/${id}`,
        method: "PUT",
        body: { students },
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ✅ 5. Delete Attendance
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetMyAttendanceQuery,
  useGetAttendanceByDateSubjectQuery,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;