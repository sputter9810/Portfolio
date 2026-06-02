import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Routes", path: "/routes" },
    { name: "Feedback", path: "/feedback" },
    { name: "Set Day Plans", path: "/plans" },
    { name: "Hold Inventory", path: "/holds" },
    { name: "Team", path: "/team" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SetterStack</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}