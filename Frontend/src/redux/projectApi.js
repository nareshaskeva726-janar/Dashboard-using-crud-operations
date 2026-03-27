import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/", 
    credentials: "include",
  }),

  tagTypes: ["Projects", "MyProjects", "Pending"],

  endpoints: (builder) => ({

    // Submit a project (student)
    submitProject: builder.mutation({
      query: (formData) => ({
        url: "submit-project",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Projects", "MyProjects", "Pending"],
    }),

    // Get projects submitted by logged-in student
    getMyProjects: builder.query({
      query: () => "my-projects",
      providesTags: ["MyProjects"],
    }),

    // Get all projects (staff)
    getProjects: builder.query({
      query: () => "all-projects",
      providesTags: ["Projects"],
    }),


    // Get pending students for staff
    getPendingStudents: builder.query({
      query: () => "getpendingprojects",
      providesTags: ["Pending"],
    }),
    

    // Send reminder to pending students (staff)
    sendReminder: builder.mutation({

      query: (data) => ({
        url: "send-reminder", // MUST MATCH projectRouter
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pending"],
    }),
  }),
});


// Export hooks for usage in components
export const {
  useSubmitProjectMutation,
  useGetProjectsQuery,
  useGetMyProjectsQuery,
  useGetPendingStudentsQuery,
  useSendReminderMutation,
} = projectApi;