import {
  Bell,
  Plus,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  CheckCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";

function Topbar({
  onNewNote,
  title = "Dashboard",
  subtitle = "Manage your collaborative workspace.",
  searchTerm = "",
  setSearchTerm = () => {},
}) {
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User",
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "user@example.com",
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  useEffect(() => {
    const syncTopbarState = () => {
      const savedTheme = localStorage.getItem("theme");
      const savedUserName = localStorage.getItem("userName") || "User";
      const savedUserEmail =
        localStorage.getItem("userEmail") || "user@example.com";

      setUserName(savedUserName);
      setUserEmail(savedUserEmail);

      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setDarkMode(false);
      }
    };

    syncTopbarState();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    window.addEventListener("storage", syncTopbarState);
    window.addEventListener("syncpad-user-updated", syncTopbarState);
    window.addEventListener("syncpad-theme-updated", syncTopbarState);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncTopbarState);
      window.removeEventListener("syncpad-user-updated", syncTopbarState);
      window.removeEventListener("syncpad-theme-updated", syncTopbarState);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target)
      ) {
        setShowBellMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = darkMode ? "light" : "dark";

    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }

    window.dispatchEvent(new Event("syncpad-theme-updated"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error("Failed to mark notifications");
    }
  };

  const handleOpenNotificationsPage = () => {
    setShowBellMenu(false);
    navigate("/notifications");
  };

  return (
    <div className="sticky top-0 z-30 border-b border-white/60 bg-[#f6f7fb]/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1120]/80">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[340px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-gray-700 dark:bg-[#1e293b] dark:text-white dark:placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1e293b] dark:text-white"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={bellDropdownRef}>
              <button
                onClick={() => {
                  setShowBellMenu((prev) => !prev);
                  setShowProfileMenu(false);
                }}
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1e293b] dark:text-white"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-[10px] font-bold text-white shadow-md">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showBellMenu && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[24px] border border-white/70 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111827]/95">
                  <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {unreadCount} unread notification
                          {unreadCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {notifications.length > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          <CheckCheck size={14} />
                          Mark all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto px-3 py-3">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                          <Bell size={18} className="text-slate-400" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-slate-200">
                          No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          Updates will appear here when available.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.slice(0, 6).map((item, index) => (
                          <div
                            key={item._id || index}
                            className={`rounded-2xl border px-4 py-3 transition ${
                              item.isRead
                                ? "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                                : "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                  {new Date(item.createdAt).toLocaleString()}
                                </p>
                              </div>

                              {!item.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 px-3 py-3 dark:border-white/10">
                    <button
                      onClick={handleOpenNotificationsPage}
                      className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onNewNote}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.04]"
            >
              <Plus size={18} />
              New Note
            </button>

            <div className="relative hidden sm:block" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowBellMenu(false);
                }}
                className="flex h-12 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1e293b] dark:hover:bg-[#243047]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-semibold text-white shadow-sm">
                  {getInitials(userName)}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-gray-700 dark:text-white">
                  {userName}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-[24px] border border-white/70 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111827]/95">
                  <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px]">
                    <div className="rounded-t-[23px] bg-white/95 px-5 py-5 dark:bg-[#111827]/95">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white shadow-md">
                          {getInitials(userName)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            {userName}
                          </p>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-3">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;