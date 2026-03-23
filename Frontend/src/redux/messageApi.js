import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const messageApi = createApi({
  reducerPath: "messageApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/",
    credentials: "include",
  }),

  tagTypes: ["Messages"],

  endpoints: (builder) => ({
    // GET CHAT HISTORY
    getMessages: builder.query({
      query: ({ senderId, receiverId }) => {
        if (!senderId || !receiverId) throw new Error("senderId and receiverId are required");
        return `messages/${senderId}/${receiverId}`;
      },
      providesTags: (result, error, arg) => [
        { type: "Messages", id: `${arg.senderId}-${arg.receiverId}` },
      ],
    }),

    // SEND MESSAGE
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "messages",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Messages", id: `${arg.senderId}-${arg.receiverId}` },
      ],
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = messageApi;