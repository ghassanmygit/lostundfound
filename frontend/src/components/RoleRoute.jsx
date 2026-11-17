import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../utils/auth";

function RoleRoute({ role }) {
  const session = getSession();
  if (!session || session.role !== role) {
    return <Navigate to="/katalog" replace />;
  }
  return <Outlet />;
}

export default RoleRoute;
