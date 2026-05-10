import { clearAuth } from "./authStorage";

export function logoutUser(navigate) {
  clearAuth();
  navigate("/login", { replace: true });
}