import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  Star,
  Tag,
  Settings,
  PenSquare,
  Bell,
} from "lucide-react";

function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Notes", icon: FileText, to: "/notes" },
    { label: "Shared", icon: Users, to: "/shared" },
    { label: "Favorites", icon: Star, to: "/favorites" },
    { label: "Tags", icon: Tag, to: "/tags" },
    { label: "Notifications", icon: Bell, to: "/notifications" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <aside className="hidden w-[280px] shrink-0 p-5 lg:flex">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-5 h-[calc(100vh-40px)] w-full overflow-y-auto rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/90"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-1 py-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-purple-500 text-white shadow-lg"
            >
              <PenSquare size={22} />
            </motion.div>

            <div>
              <h1 className="text-[1.8rem] font-bold text-gray-950 dark:text-white">
                SyncPad
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Realtime workspace
              </p>
            </div>
          </div>

          <div className="mt-8 px-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
              Workspace
            </p>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {navItems.map(({ label, icon: Icon, to }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                    }`
                  }
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl">
                    <Icon size={18} />
                  </div>
                  {label}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>
    </aside>
  );
}

export default Sidebar;