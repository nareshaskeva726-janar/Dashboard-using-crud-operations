import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import StartRoute from "./route/StartRoute";
import { Toaster } from "react-hot-toast";

import { useCheckAuthQuery } from "./redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";

const App = () => {

  const dispatch = useDispatch();

  const { data } = useCheckAuthQuery();

  useEffect(() => {
    if (data?.user) {
      dispatch(loginSuccess({ user: data.user, token: "cookie-token" }));
    }
  }, [data, dispatch]);

  return (
    <BrowserRouter>
      <Toaster />
      <StartRoute />
    </BrowserRouter>
  );
};

export default App;