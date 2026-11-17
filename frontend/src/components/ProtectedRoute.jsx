import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../utils/auth";
import AppLayout from "./AppLayout";

function ProtectedRoute() {
  if (!getSession()) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default ProtectedRoute;
