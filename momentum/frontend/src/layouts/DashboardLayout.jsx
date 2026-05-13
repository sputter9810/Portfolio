function DashboardLayout({ title, subtitle, actions, children }) {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>

        {actions && <div>{actions}</div>}
      </header>

      <section className="dashboard-content">{children}</section>
    </main>
  );
}

export default DashboardLayout;