import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, PenSquare } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
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
      await API.post("/auth/register", formData);
      toast.success("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data?.message || "Registration failed");
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT SIDE */}
          <div className="hidden lg:block">
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <PenSquare size={16} />
                </div>
                SyncPad Workspace
              </div>

              <h1 className="mt-8 text-6xl font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
                Create your
                <br />
                collaborative
                <br />
                workspace
                <span className="text-indigo-600"> today</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Start building notes, collaborating in real time, sharing with your team,
                and tracking version history — all in one place.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4">
                <FeatureCard title="Organize" text="Tags & search" />
                <FeatureCard title="Collaborate" text="Live editing" />
                <FeatureCard title="Track" text="Version history" />
              </div>

              <div className="mt-10 space-y-4">
                <InfoPoint text="Write and edit notes together in real time." />
                <InfoPoint text="Restore previous versions instantly." />
                <InfoPoint text="Share notes with teammates easily." />
              </div>

            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[470px] rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-10">

              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.30em] text-indigo-600">
                  Create account
                </p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-950">
                  Join SyncPad
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  Start your premium workspace and collaborate beautifully.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

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
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.28)] transition hover:scale-[1.02]"
                >
                  Create account
                  <ArrowRight size={16} />
                </button>

              </form>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-600 hover:text-violet-600"
                  >
                    Login
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase text-gray-400">{title}</p>
      <p className="mt-2 font-semibold text-gray-900">{text}</p>
    </div>
  );
}

function InfoPoint({ text }) {
  return (
    <div className="flex items-center gap-3 text-gray-700">
      <CheckCircle2 size={18} className="text-indigo-600" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Register;