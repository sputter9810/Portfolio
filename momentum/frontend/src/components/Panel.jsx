import PropTypes from "prop-types";

function Panel({
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <section className="panel">
      {(title || subtitle || actions) && (
        <div className="panel-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>

          {actions && (
            <div className="panel-actions">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="panel-content">
        {children}
      </div>
    </section>
  );
}

Panel.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default Panel;