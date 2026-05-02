import { useEffect, useState } from "react";
import "./index.css";
import type { Activity, ActivityCategory, ActivityPriority } from "./types";

type View = "dashboard" | "activities" | "schedule";

const navItems: View[] = ["dashboard", "activities", "schedule"];
const STORAGE_KEY = "lifestack.activities";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, []);

  function saveActivities(nextActivities: Activity[]) {
    setActivities(nextActivities);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActivities));
  }

  function addActivity(formData: FormData) {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") || ""),
      category: String(formData.get("category") || "project") as ActivityCategory,
      priority: String(formData.get("priority") || "medium") as ActivityPriority,
      frequencyPerWeek: Number(formData.get("frequencyPerWeek") || 1),
      sessionLengthMinutes: Number(formData.get("sessionLengthMinutes") || 60),
      notes: String(formData.get("notes") || ""),
    };

    if (!newActivity.name.trim()) return;

    saveActivities([...activities, newActivity]);
  }

  function deleteActivity(id: string) {
    saveActivities(activities.filter((activity) => activity.id !== id));
  }

  const totalWeeklySessions = activities.reduce(
    (total, activity) => total + activity.frequencyPerWeek,
    0
  );

  const highPriorityCount = activities.filter(
    (activity) => activity.priority === "high"
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>LifeStack</h1>
          <p>Personal progress scheduler</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={view === item ? "nav-button active" : "nav-button"}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {view === "dashboard" && (
          <section>
            <p className="eyebrow">Overview</p>

            <div className="page-header">
              <div>
                <h2>Dashboard</h2>
                <p className="muted">
                  Your projects, habits, training, meals and hobbies in one
                  place.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <span>Total activities</span>
                <strong>{activities.length}</strong>
              </article>

              <article className="stat-card">
                <span>Weekly sessions</span>
                <strong>{totalWeeklySessions}</strong>
              </article>

              <article className="stat-card">
                <span>High priority</span>
                <strong>{highPriorityCount}</strong>
              </article>
            </div>

            <div className="dashboard-grid">
              <article className="card">
                <h3>Top priorities</h3>

                {activities.length === 0 ? (
                  <p className="muted">
                    No activities yet. Add one to get started.
                  </p>
                ) : (
                  <div className="stack-list">
                    {activities
                      .filter((activity) => activity.priority === "high")
                      .slice(0, 5)
                      .map((activity) => (
                        <div key={activity.id} className="mini-row">
                          <div>
                            <strong>{activity.name}</strong>
                            <p className="muted">
                              {activity.category} · {activity.frequencyPerWeek}
                              x/week
                            </p>
                          </div>

                          <span className="pill high">high</span>
                        </div>
                      ))}

                    {highPriorityCount === 0 && (
                      <p className="muted">
                        No high-priority activities yet.
                      </p>
                    )}
                  </div>
                )}
              </article>

              <article className="card">
                <h3>Weekly rhythm</h3>

                {activities.length === 0 ? (
                  <p className="muted">
                    Your weekly workload will appear here.
                  </p>
                ) : (
                  <div className="stack-list">
                    {activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="mini-row">
                        <div>
                          <strong>{activity.name}</strong>
                          <p className="muted">
                            {activity.frequencyPerWeek} sessions ·{" "}
                            {activity.sessionLengthMinutes} min
                          </p>
                        </div>

                        <span className="pill">{activity.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </section>
        )}

        {view === "activities" && (
          <section>
            <p className="eyebrow">Planning inputs</p>
            <h2>Activities</h2>
            <p className="muted">
              Add the things you want to work on consistently.
            </p>

            <form
              className="card activity-form"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                addActivity(formData);
                event.currentTarget.reset();
              }}
            >
              <input name="name" placeholder="Activity name" />

              <select name="category" defaultValue="project">
                <option value="project">Project</option>
                <option value="fitness">Fitness</option>
                <option value="meal">Meal</option>
                <option value="hobby">Hobby</option>
                <option value="life">Life</option>
                <option value="other">Other</option>
              </select>

              <select name="priority" defaultValue="medium">
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>

              <input
                name="frequencyPerWeek"
                type="number"
                min="1"
                max="7"
                defaultValue="2"
                placeholder="Sessions per week"
              />

              <input
                name="sessionLengthMinutes"
                type="number"
                min="10"
                step="5"
                defaultValue="60"
                placeholder="Minutes"
              />

              <textarea name="notes" placeholder="Notes" />

              <button className="primary-button" type="submit">
                Add Activity
              </button>
            </form>

            <div className="activity-list">
              {activities.map((activity) => (
                <article key={activity.id} className="card activity-row">
                  <div>
                    <h3>{activity.name}</h3>
                    <p className="muted">
                      {activity.category} · {activity.priority} ·{" "}
                      {activity.frequencyPerWeek}x/week ·{" "}
                      {activity.sessionLengthMinutes} min
                    </p>
                    {activity.notes && <p>{activity.notes}</p>}
                  </div>

                  <button
                    className="danger-button"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "schedule" && (
          <section>
            <p className="eyebrow">Weekly rhythm</p>
            <h2>Schedule</h2>
            <p className="muted">
              Next we’ll generate a balanced week from your activities.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}