import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {

  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;