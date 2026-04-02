import {
  Bell,
  Plus,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Topbar({
  onNewNote,
  title = "Dashboard",
  subtitle = "Manage your collaborative workspace.",
  searchTerm = "",
  setSearchTerm = () => {},
  showNewNoteButton = true,
}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User",
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const syncTopbarState = () => {
      const savedTheme = localStorage.getItem("theme");
      const savedUserName = localStorage.getItem("userName") || "User";

      setUserName(savedUserName);

      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setDarkMode(false);
      }
    };

    syncTopbarState();
    window.addEventListener("storage", syncTopbarState);

    return () => window.removeEventListener("storage", syncTopbarState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleNewNote = () => {
    if (typeof onNewNote === "function") {
      onNewNote();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      toast.error("New note action is not available here");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("theme");

    setShowProfileMenu(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#020817]/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-800 dark:text-slate-100 md:flex">
                <Search size={18} className="opacity-90" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-[28px]">
                  {title}
                </h1>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showNewNoteButton && (
              <button
                onClick={handleNewNote}
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:px-5"
              >
                <Plus size={16} />
                New Note
              </button>
            )}

            <button
              onClick={() => navigate("/notifications")}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-12 sm:w-12"
            >
              <Bell size={18} />
            </button>

            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-12 sm:w-12"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:gap-3 sm:px-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <User size={16} />
                </div>

                <span className="hidden max-w-[120px] truncate sm:inline">
                  {userName}
                </span>

                <ChevronDown
                  size={16}
                  className={`transition ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-slate-700/80 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      Signed in as
                    </p>
                    <p className="mt-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {userName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition focus-within:border-slate-300 focus-within:bg-white dark:border-slate-700/80 dark:bg-slate-900/80 dark:focus-within:border-slate-600 dark:focus-within:bg-slate-900 md:max-w-[380px]">
          <Search size={17} className="text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
      </div>
    </header>
  );
}

export default Topbar;