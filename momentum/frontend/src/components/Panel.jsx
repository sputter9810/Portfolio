function Panel({ title, subtitle, actions, children }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {children}
    </section>
  );
}

export default Panel;