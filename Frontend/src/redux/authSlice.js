import { createSlice } from "@reduxjs/toolkit";

//Alwys token want to store in cookies because we have multiple users so we use Token



// Get token from cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  // console.log(value, "values");
  const parts = value.split(`; ${name}=`);
  // console.log(parts, "parts");

  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};





// set cookie

/* Arguments passed name, value, days*/
const setCookie = (name, value, days) => {

  //expires is a varible dta is stored here 
  const expires = new Date();

  //Token is expires in within a time
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  //using utc string template literals
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};


// delete cookie
const deleteCookie = (name) => {
  //delete the cookie
  document.cookie = `${name}=; Max-Age=0; path=/`;
};


//Local storage for users details
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: getCookie("token") || null,

  //To check the boolean value
  isAuthenticated: !!getCookie("token"),
};


//creating a slice function using redux/toolkit
const authSlice = createSlice({
  name: "auth",
  initialState, //calling the initial state
  reducers: {

    //login funcationality using create Slice
    loginSuccess: (state, action) => {

      //taken the user and token in actions of payload properties
      const { user, token } = action.payload;

      //saving states 
      state.user = user;

      state.token = token;

      state.isAuthenticated = true;

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      // Save token
      setCookie("token", token, 7);
    },




    //logout functionality
    logout: (state) => {
      state.user = null; // remove the users data from localstorage
      state.token = null; // remove the token from the cookies
      state.isAuthenticated = false; //make the authenticated state false
      localStorage.removeItem("user"); // remove the user
      deleteCookie("token"); // del the cookie token it will be empty
    },
  },
});

//exporting
export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer; // reducer is a pure function


// SELECTORS
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;