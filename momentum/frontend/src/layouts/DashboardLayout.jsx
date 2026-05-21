import PropTypes from "prop-types";

function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>Momentum</h2>
          <p>Productivity Platform</p>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active">
            Dashboard
          </button>

          <button className="sidebar-link">
            Tasks
          </button>

          <button className="sidebar-link">
            Analytics
          </button>

          <button className="sidebar-link">
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>Momentum v0.6</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="dashboard-header-actions">
            {actions}
          </div>
        </header>

        <section className="dashboard-content">
          {children}
        </section>
      </main>
    </div>
  );
}

DashboardLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default DashboardLayout;