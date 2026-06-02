import {
  currentUser,
  nextSetDay,
  assignments,
  routeHealth,
  holdUsageAlerts,
  recentActivity,
} from "../data/mockData";

export default function Dashboard() {
  const isHeadSetter = currentUser.role === "head_setter";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Welcome back, {currentUser.name}</p>
          <h1>Dashboard</h1>
        </div>

        {isHeadSetter && (
          <button className="primary-button">Create Set Day Plan</button>
        )}
      </div>

      <div className="dashboard-grid">
        <section className="card large-card">
          <div className="card-header">
            <h2>Next Set Day</h2>
            <span className="status-pill">{nextSetDay.status}</span>
          </div>

          <h3>{nextSetDay.name}</h3>
          <p>{nextSetDay.date} · {nextSetDay.startTime}</p>
          <p>Sectors: {nextSetDay.sectors.join(", ")}</p>
          <p className="muted">{nextSetDay.notes}</p>
        </section>

        <section className="card">
          <h2>Quick Actions</h2>

          <div className="action-list">
            <button>Log Floor Feedback</button>
            <button>Add Route</button>
            <button>Add Tweak Note</button>
            {isHeadSetter && <button>Review Plan</button>}
          </div>
        </section>

        <section className="card large-card">
          <h2>{isHeadSetter ? "Set Day Assignments" : "My Assignments"}</h2>

          <div className="assignment-list">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div>
                  <strong>
                    {assignment.colour} Grade {assignment.grade}
                  </strong>
                  <p>
                    {assignment.setter} · {assignment.sector}
                  </p>
                  <p className="muted">
                    {assignment.styleTags.join(", ")}
                  </p>
                </div>

                <span className={`status-pill ${assignment.status.toLowerCase().replace(" ", "-")}`}>
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Route Health</h2>

          <div className="stat-grid">
            <div>
              <strong>{routeHealth.activeRoutes}</strong>
              <span>Active Routes</span>
            </div>
            <div>
              <strong>{routeHealth.flaggedRoutes}</strong>
              <span>Flagged</span>
            </div>
            <div>
              <strong>{routeHealth.needsTweaks}</strong>
              <span>Need Tweaks</span>
            </div>
          </div>

          <p className="muted">
            Missing: {routeHealth.missingGrades.join(", ")}
          </p>
        </section>

        <section className="card">
          <h2>Hold Usage Alerts</h2>

          <ul className="simple-list">
            {holdUsageAlerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Recent Activity</h2>

          <ul className="simple-list">
            {recentActivity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}