import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastContainer} from 'react-toastify';

import { useCheckAuthQuery } from "./redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";
import LayoutRouter from "./route/LayoutRouter";

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
      <ToastContainer />
      <LayoutRouter />
    </BrowserRouter>
  );
};

export default App;