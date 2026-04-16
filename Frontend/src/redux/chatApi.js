import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API ,
    credentials: "include",
  }),

  tagTypes: ["Chat", "Users", "Monitor"],

  endpoints: (builder) => ({

    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat", "User"],
    }),

    getConversation: builder.query({
      query: ({ userA, userB }) =>
        `/conversation?userA=${userA}&userB=${userB}`,
      providesTags: ["Chat"],
    }),


    getChatUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    getAllMessages: builder.query({
      query: () => "/all-messages",
      providesTags: ["Monitor"],
    }),
  }),
});


export const {
  useSendMessageMutation,
  useGetConversationQuery,
  useGetChatUsersQuery,
  useGetAllMessagesQuery,
} = chatApi;