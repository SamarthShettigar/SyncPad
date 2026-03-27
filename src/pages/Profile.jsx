import { useEffect, useState } from "react";
import { User, Mail, Moon, Sun, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../components/layout/AppShell";

function Profile() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [email] = useState(localStorage.getItem("userEmail") || "");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    localStorage.setItem("userName", name.trim());
    toast.success("Profile updated successfully");

    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AppShell
      title="Profile & Settings"
      subtitle="Manage your account preferences"
      onNewNote={() => navigate("/dashboard?create=true")}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/80">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-5 dark:border-white/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-xl font-bold text-white">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your Profile
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update your personal information and preferences
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <User size={16} />
                Display Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-[#172033] dark:text-slate-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/80">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Appearance
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose how SyncPad looks for you
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  toast.success("Light mode enabled");
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  theme === "light"
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
                }`}
              >
                <Sun size={16} />
                Light
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  toast.success("Dark mode enabled");
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  theme === "dark"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-red-200 bg-white/80 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-red-500/20 dark:bg-[#0f172a]/80">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Account Actions
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign out from your current session
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Profile;