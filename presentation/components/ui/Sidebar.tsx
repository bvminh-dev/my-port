import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Port Manager</div>
      <nav className="sidebar-nav">
        <span className="sidebar-nav-item active">Ports</span>
      </nav>
      <div className="sidebar-footer">
        <ThemeToggle />
      </div>
    </aside>
  );
}
