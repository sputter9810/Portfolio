import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Panel from "../components/Panel";
import DashboardLayout from "../layouts/DashboardLayout";
import { createTask, deleteTask, getTasks, updateTask } from "../api/taskApi";
import { getUser } from "../utils/authStorage";
import { logoutUser } from "../utils/logout";

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks(status = "") {
    setIsLoading(true);
    setError("");

    try {
      const data = await getTasks(status);
      setTasks(data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not load tasks.";

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

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreateTask(event) {
    event.preventDefault();

    setError("");
    setIsCreating(true);

    try {
      await createTask(formData);

      setFormData({
        title: "",
        description: "",
      });

      await loadTasks(statusFilter);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not create task.";

      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(task, newStatus) {
    setError("");

    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description || "",
        status: newStatus,
      });

      await loadTasks(statusFilter);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not update task.";

      setError(message);
    }
  }

  async function handleDeleteTask(taskId) {
    setError("");

    try {
      await deleteTask(taskId);
      await loadTasks(statusFilter);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not delete task.";

      setError(message);
    }
  }

  return (
    <DashboardLayout
      title="Momentum Dashboard"
      subtitle={
        user
          ? `Logged in as ${user.name} (${user.email})`
          : "Authenticated workspace"
      }
      actions={<button onClick={handleLogout}>Logout</button>}
    >
      {error && <div className="alert error">{error}</div>}

      <Panel
        title="Create Task"
        subtitle="Add a task to your productivity workflow."
      >
        <form className="task-form" onSubmit={handleCreateTask}>
          <label>
            Title
            <input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. Finish Momentum UI polish"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Optional details..."
              rows="3"
            />
          </label>

          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Task"}
          </button>
        </form>
      </Panel>

      <Panel
        title="Your Tasks"
        subtitle="Tasks loaded from your secured backend."
        actions={
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
        }
      >
        {isLoading && <p className="muted">Loading tasks...</p>}

        {!isLoading && tasks.length === 0 && (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p className="muted">Create your first task above.</p>
          </div>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div className="task-content">
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p className="muted">{task.description}</p>
                  )}
                </div>

                <div className="task-actions">
                  <span className={`status-pill status-${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>

                  <select
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(task, event.target.value)
                    }
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>

                  <button
                    className="danger-button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </DashboardLayout>
  );
}

export default DashboardPage;