import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/authStorage";
import { logoutUser } from "../utils/logout";

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logoutUser(navigate);
  }

  return (
    <main className="page">
      <h1>Momentum Dashboard</h1>

      {user ? (
        <p className="muted">
          Logged in as <strong>{user.name}</strong> ({user.email})
        </p>
      ) : (
        <p className="muted">No user found in local storage.</p>
      )}

      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}

export default DashboardPage;