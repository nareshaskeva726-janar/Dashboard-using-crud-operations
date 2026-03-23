import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include",
  }),

  tagTypes: ["Attendance"],

  endpoints: (builder) => ({

  
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendance/mark",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),


    checkAttendance: builder.query({
      query: () => "/attendance/check",
      providesTags: ["Attendance"],
      keepUnusedDataFor: 60,
    }),

    getMonthlySummary: builder.query({
      query: ({ month, year }) =>
        `/attendance/monthly-summary?month=${month}&year=${year}`,
      providesTags: ["Attendance"], 
      keepUnusedDataFor: 60,
    }),


    
    deleteAttendance: builder.mutation({
      query: ({ date, subject }) => ({
        url: `/attendance?date=${date}&subject=${subject}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),

    
    getMyAttendance: builder.query({
      query: () => "/attendance/my",
      providesTags: ["Attendance"], 
      keepUnusedDataFor: 60,
    }),

   
    
    getAttendanceByDateSubject: builder.query({
      query: ({ date, subject }) =>
        `/attendance?date=${date}&subject=${subject}`,
      providesTags: ["Attendance"], 
      keepUnusedDataFor: 60,
    }),

    

    updateAttendance: builder.mutation({
      query: ({ id, students }) => ({
        url: `/attendance/${id}`,
        method: "PUT",
        body: { students },
      }),
      invalidatesTags: ["Attendance"], 
    }),

  }),
});

export const {
  useMarkAttendanceMutation,
  useGetMyAttendanceQuery,
  useGetMonthlySummaryQuery,
  useGetAttendanceByDateSubjectQuery,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useCheckAttendanceQuery,
} = attendanceApi;