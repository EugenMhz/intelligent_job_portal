import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function SignupPage({ onSignupSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Job Seeker",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const data = await api.signup(form);
      setMessage(data.message || "Signup successful.");
      if (onSignupSuccess) {
        onSignupSuccess(data.user);
      }
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.message || "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Start here</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Join as a job seeker or recruiter.</p>

        {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="signup-role" className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="signup-role"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <option>Job Seeker</option>
              <option>Recruiter</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {isSubmitting ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">Login</Link>
        </p>
      </section>
    </main>
  );
}
