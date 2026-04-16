import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  activeChatUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload.messages || [];
    },

    

    addMessage: (state, action) => {

      const msg = action.payload;

      // prevent duplicates
      const exists = state.messages.some(
        (m) => m._id === msg._id
      );

      if (!exists) {
        state.messages.push(msg);
      }
    },

    setActiveChatUser: (state, action) => {
      state.activeChatUser = action.payload;
      state.messages = []; 
    },
  },
});

export const {
  setMessages,
  addMessage,
  setActiveChatUser,
} = chatSlice.actions;

export default chatSlice.reducer;