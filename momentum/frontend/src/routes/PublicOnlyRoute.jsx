import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authStorage";

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;