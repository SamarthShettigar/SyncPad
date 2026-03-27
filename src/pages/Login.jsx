import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, PenSquare } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem("userName", res.data.user.name);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error(error.response?.data?.message || "Login failed");
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <PenSquare size={16} />
                </div>
                SyncPad Workspace
              </div>

              <h1 className="mt-8 text-6xl font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
                Notes,
                <br />
                collaboration,
                <br />
                and version history
                <span className="text-indigo-600"> in one place</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Continue into a cleaner workspace for real-time editing, note
                sharing, in-note chat, and restore-ready version history.
              </p>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
                <FeatureCard title="Realtime" text="Live editing" />
                <FeatureCard title="History" text="Version restore" />
                <FeatureCard title="Team" text="Shared workspace" />
              </div>

              <div className="mt-10 space-y-4">
                <InfoPoint text="Collaborate live with teammates inside the same note." />
                <InfoPoint text="Track every version and restore earlier note states." />
                <InfoPoint text="Keep chat and editing inside one polished workflow." />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[470px] rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-10">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.30em] text-indigo-600">
                  Welcome back
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                  Login to SyncPad
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Access your notes, recent edits, and team workspace with a
                  clean premium experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.28)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(79,70,229,0.34)] active:scale-[0.99]"
                >
                  Login
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-indigo-600 transition hover:text-violet-600"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="mt-8 max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <PenSquare size={16} />
                </div>
                SyncPad Workspace
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                Notes, collaboration, and version history
                <span className="text-indigo-600"> in one place</span>.
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Write together, share instantly, restore versions, and keep your
                note workflow beautifully organized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-base font-semibold text-slate-900">{text}</p>
    </div>
  );
}

function InfoPoint({ text }) {
  return (
    <div className="flex items-center gap-3 text-slate-700">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <CheckCircle2 size={16} />
      </div>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

export default Login;