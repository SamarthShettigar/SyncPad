import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Star,
  Tag,
  Bell,
  Settings,
  PenSquare,
  LogOut,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "My Notes", icon: FileText, to: "/notes" },
  { label: "Shared", icon: Users, to: "/shared" },
  { label: "Favorites", icon: Star, to: "/favorites" },
  { label: "Tags", icon: Tag, to: "/tags" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("theme");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="hidden w-[290px] shrink-0 border-r border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#020817] lg:flex">
      <div className="flex w-full flex-col px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-800 dark:text-slate-100">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                SyncPad
              </h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                Welcome, {userName}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <PenSquare size={16} />
          Quick New Note
        </button>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-sky-500/25 bg-sky-500/12 text-sky-100 shadow-sm"
                      : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-slate-100"
                  }`
                }
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    location.pathname === item.to
                      ? "bg-sky-400/15 text-sky-100"
                      : "bg-slate-100 text-slate-700 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-800"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Workspace
          </p>
          <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Premium Notes Experience
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Organize, collaborate, and refine notes with a cleaner workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;