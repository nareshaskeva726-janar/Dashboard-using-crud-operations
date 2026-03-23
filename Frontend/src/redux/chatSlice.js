import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    // Load messages from database/API
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    // Add new message (from socket or user send)
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Clear chat when switching users
    clearMessages: (state) => {
      state.messages = [];
    },

  },
});

export const { setMessages, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;