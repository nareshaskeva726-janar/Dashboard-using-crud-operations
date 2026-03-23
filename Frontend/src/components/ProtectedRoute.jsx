import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Allusers from "../pages/AllUsers";

function ProtectedRoute() {

    const { user } = useSelector((state) => state.auth);
  //USER IS SAVING IN THE LOCALSTORAGE SO ONLY IT IS NOT LOGOUT AFTER REFRESH 
  //BECAUSE OF THIS LOGIC
  const storedUser = localStorage.getItem("user");

  if (!user && !storedUser) {
    return <Navigate to="/" replace />;
  }



  
  
  return <Outlet />;
}

export default ProtectedRoute;