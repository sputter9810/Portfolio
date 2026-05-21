import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Panel from "../components/Panel";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createTask,
  deleteTask,
  getTasks,
  getTaskStatistics,
  updateTask,
} from "../api/taskApi";
import { getUser } from "../utils/authStorage";
import { logoutUser } from "../utils/logout";

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [tasks, setTasks] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState("");

  async function loadDashboardData(status = "", search = "") {
    setIsLoading(true);
    setError("");

    try {
      const [taskData, statisticsData] = await Promise.all([
        getTasks(status, search),
        getTaskStatistics(),
      ]);

      taskData.sort((a, b) => {
        const priorityOrder = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        const priorityDifference =
          priorityOrder[b.priority] - priorityOrder[a.priority];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      setTasks(taskData);
      setStatistics(statisticsData);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not load dashboard.";

      setError(message);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logoutUser(navigate);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData(statusFilter, searchTerm);
  }, [statusFilter, searchTerm]);

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
        priority: "MEDIUM",
        dueDate: "",
      });

      await loadDashboardData(statusFilter, searchTerm);
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
        priority: task.priority,
        dueDate: task.dueDate,
      });

      await loadDashboardData(statusFilter, searchTerm);
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

      await loadDashboardData(statusFilter, searchTerm);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not delete task.";

      setError(message);
    }
  }

  function formatDueDate(dateString) {
    if (!dateString) return null;

    return new Date(dateString).toLocaleDateString();
  }

  function isOverdue(task) {
    if (!task.dueDate || task.status === "DONE") {
      return false;
    }

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
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

      {statistics && (
        <section className="statistics-grid">
          <article className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <strong>{statistics.totalTasks}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">TODO</span>
            <strong>{statistics.todoTasks}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">In Progress</span>
            <strong>{statistics.inProgressTasks}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">Completed</span>
            <strong>{statistics.completedTasks}</strong>
          </article>

          <article className="stat-card stat-card-highlight">
            <span className="stat-label">Completion</span>
            <strong>{statistics.completionPercentage}%</strong>
          </article>
        </section>
      )}

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

          <label>
            Priority
            <select
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleFormChange}
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
          <div className="task-toolbar">
            <input
              className="search-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

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
        }
      >
        {isLoading && <p className="muted">Loading tasks...</p>}

        {!isLoading && tasks.length === 0 && (
          <div className="empty-state">
            <h3>No matching tasks</h3>
            <p className="muted">
              Try changing your search or filter settings.
            </p>
          </div>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <article
                className={`task-card ${isOverdue(task) ? "task-overdue" : ""}`}
                key={task.id}
              >
                <div className="task-content">
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p className="muted">{task.description}</p>
                  )}

                  {task.dueDate && (
                    <p className={isOverdue(task) ? "due-date overdue" : "due-date"}>
                      Due: {formatDueDate(task.dueDate)}
                    </p>
                  )}
                </div>

                <div className="task-actions">
                  <span
                    className={`priority-pill priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

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