import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../api/taskApi";
import { getUser } from "../utils/authStorage";
import { logoutUser } from "../utils/logout";

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks(status = "") {
    setIsLoading(true);
    setError("");

    try {
      const data = await getTasks(status);
      setTasks(data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not load tasks. Please try again.";

      setError(message);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logoutUser(navigate);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks(statusFilter);
  }, [statusFilter]);

  function handleLogout() {
    logoutUser(navigate);
  }

  return (
    <main className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Momentum Dashboard</h1>
          {user && (
            <p className="muted">
              Logged in as <strong>{user.name}</strong> ({user.email})
            </p>
          )}
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Your Tasks</h2>
            <p className="muted">Tasks are loaded from your secured backend API.</p>
          </div>

          <label className="filter-label">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </label>
        </div>

        {isLoading && <p className="muted">Loading tasks...</p>}

        {error && <div className="alert error">{error}</div>}

        {!isLoading && !error && tasks.length === 0 && (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p className="muted">Create your first task soon.</p>
          </div>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  {task.description && (
                    <p className="muted">{task.description}</p>
                  )}
                </div>

                <span className={`status-pill status-${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;