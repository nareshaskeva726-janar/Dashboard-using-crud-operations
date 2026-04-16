import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API+"/api"  ,
    credentials: "include",
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    // ================= STAFF =================
    announceProject: builder.mutation({
      query: (data) => ({
        url: "/projects/announce",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),
    getPendingStudents: builder.query({
      query: () => "/projects/pending-students",
      providesTags: ["Project"],
    }),
    staffReminder: builder.mutation({
      query: (data) => ({
        url: "/projects/staff-reminder",
        method: "POST",
        body: data,
      }),
    }),
    getStaffProjects: builder.query({
      query: () => "/projects/staff-projects",
      providesTags: ["Project"],
    }),

    getAdminProjects: builder.query({
      query: () => "/projects/get-admin-projects",
      providesTags: ["Project"],
    }),

    // ================= STUDENT =================
    submitProject: builder.mutation({
      query: (data) => ({
        url: "/projects/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),


    getMyProjects: builder.query({
      query: () => "/projects/my-projects",
      providesTags: ["Project"],
    }),

    // ================= SUPERADMIN =================
    getAllProjectsSuperadmin: builder.query({
      query: () => "/projects/all-projects-superadmin",
      providesTags: ["Project"],
    }),

    superadminWarning: builder.mutation({
      query: (data) => ({
        url: "/projects/superadmin-warning",
        method: "POST",
        body: data,
      }),
    }),

    // ================= ADMIN =================
    hodReminder: builder.mutation({
      query: (data) => ({
        url: "/projects/hod-reminder",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {

  useGetAllProjectsSuperadminQuery,
  useAnnounceProjectMutation,

  useGetPendingStudentsQuery,
  useStaffReminderMutation,

  useGetAdminProjectsQuery,

  useGetStaffProjectsQuery,
  useSubmitProjectMutation,

  useGetMyProjectsQuery,
  useHodReminderMutation,

  useSuperadminWarningMutation,
} = projectApi;