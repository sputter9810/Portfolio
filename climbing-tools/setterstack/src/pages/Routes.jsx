import { routes } from "../data/mockData";

function getTotalFeedback(feedback) {
  return feedback.positive + feedback.neutral + feedback.negative;
}

function getFeedbackLabel(feedback) {
  const total = getTotalFeedback(feedback);

  if (total === 0) return "No feedback";

  return `${feedback.positive} positive / ${feedback.negative} negative`;
}

export default function RoutesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Route register</p>
          <h1>Routes</h1>
        </div>

        <button className="primary-button">Add Route</button>
      </div>

      <div className="summary-grid">
        <section className="card">
          <h2>Active Routes</h2>
          <strong className="summary-number">
            {routes.filter((route) => route.status === "Active").length}
          </strong>
        </section>

        <section className="card">
          <h2>Needs Attention</h2>
          <strong className="summary-number">
            {
              routes.filter(
                (route) =>
                  route.status === "Needs Tweaks" ||
                  route.status === "Flagged"
              ).length
            }
          </strong>
        </section>

        <section className="card">
          <h2>Total Feedback</h2>
          <strong className="summary-number">
            {routes.reduce(
              (total, route) => total + getTotalFeedback(route.feedback),
              0
            )}
          </strong>
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Current Rotation</h2>
            <p className="muted">
              Current active climbs and routes requiring attention.
            </p>
          </div>

          <div className="filter-row">
            <button className="filter-button active">Current</button>
            <button className="filter-button">Previous</button>
            <button className="filter-button">Archived</button>
          </div>
        </div>

        <div className="route-table-wrapper">
          <table className="route-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Sector</th>
                <th>Grade</th>
                <th>Colour</th>
                <th>Setter</th>
                <th>Hold Sets</th>
                <th>Style</th>
                <th>Feedback</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {routes.map((route) => (
                <tr key={route.id}>
                  <td>{route.code}</td>
                  <td>{route.sector}</td>
                  <td>Grade {route.grade}</td>
                  <td>{route.colour}</td>
                  <td>{route.setter}</td>
                  <td>{route.holdSets.join(", ")}</td>
                  <td>
                    <div className="tag-list">
                      {route.styleTags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{getFeedbackLabel(route.feedback)}</td>
                  <td>
                    <span
                      className={`status-pill ${route.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {route.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}