"use client";

import { useState } from "react";

type Job = {
  id: string;
  title: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  description?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created?: string;
};

const navItems = [
  { label: "Dashboard", icon: "⌂", active: true },
  { label: "Job Search", icon: "⌕" },
  { label: "Applications", icon: "↗" },
  { label: "Resume", icon: "▤" },
  { label: "Settings", icon: "⚙" },
];

export default function Dashboard() {
  const [autoApply, setAutoApply] = useState(false);

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchJobs = async () => {
    if (!role.trim()) {
      setError("Please enter a target job role.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/search?role=${encodeURIComponent(
          role
        )}&location=${encodeURIComponent(location)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Job search failed.");
      }

      setJobs(data.results || []);
    } catch (err) {
      console.error(err);
      setJobs([]);
      setError("Unable to find jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      return `£${Math.round(job.salary_min).toLocaleString()} - £${Math.round(
        job.salary_max
      ).toLocaleString()}`;
    }

    if (job.salary_min) {
      return `From £${Math.round(job.salary_min).toLocaleString()}`;
    }

    if (job.salary_max) {
      return `Up to £${Math.round(job.salary_max).toLocaleString()}`;
    }

    return "Salary not specified";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-white/[0.02] px-5 py-6 lg:block">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 17L10 11L14 15L20 9" />
                <path d="M14 9H20V15" />
              </svg>
            </div>

            <span className="text-xl font-bold">
              Job<span className="text-cyan-400">Bot</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                  item.active
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auto Apply */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold">Auto Apply</p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Automatically apply to eligible matching jobs.
            </p>

            <button
              onClick={() => setAutoApply(!autoApply)}
              className={`mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                autoApply
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              <span>{autoApply ? "Enabled" : "Disabled"}</span>

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  autoApply ? "bg-cyan-400" : "bg-slate-600"
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Your job search at a glance
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.08] hover:text-white">
                ♢
              </button>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold">
                  A
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-medium">Job Seeker</p>

                  <p className="text-[10px] text-slate-500">Free Plan</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Find your next opportunity.
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Let JobBot discover relevant jobs and help you apply smarter.
              </p>
            </div>

            {/* Search Box */}
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                {/* Role */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Target role
                  </label>

                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchJobs();
                      }
                    }}
                    placeholder="e.g. VLSI Design Engineer"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchJobs();
                      }
                    }}
                    placeholder="e.g. Hyderabad, Bangalore"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={searchJobs}
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                  >
                    {loading ? "Searching..." : "Search Jobs"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-xs text-red-400">{error}</p>
              )}
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-cyan-400">⌕</span>

                  <span className="text-2xl font-bold">{jobs.length}</span>
                </div>

                <p className="mt-3 text-xs text-slate-500">Jobs Found</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-cyan-400">★</span>

                  <span className="text-2xl font-bold">-</span>
                </div>

                <p className="mt-3 text-xs text-slate-500">High Matches</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-cyan-400">↗</span>

                  <span className="text-2xl font-bold">0</span>
                </div>

                <p className="mt-3 text-xs text-slate-500">Applications</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-cyan-400">✓</span>

                  <span className="text-2xl font-bold">0</span>
                </div>

                <p className="mt-3 text-xs text-slate-500">Interviews</p>
              </div>
            </div>

            {/* Jobs */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h3 className="font-semibold">Recommended Jobs</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Real jobs matching your search
                  </p>
                </div>

                {jobs.length > 0 && (
                  <span className="text-xs text-cyan-400">
                    {jobs.length} jobs
                  </span>
                )}
              </div>

              {/* No jobs */}
              {jobs.length === 0 && !loading ? (
                <div className="flex min-h-64 items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl text-slate-500">
                      ⌕
                    </div>

                    <h4 className="mt-4 text-sm font-medium">
                      No jobs yet
                    </h4>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                      Enter your target role and location above to find real
                      job opportunities.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 transition hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white">
                            {job.title}
                          </h4>

                          <p className="mt-1 text-xs text-cyan-400">
                            {job.company?.display_name ||
                              "Company not specified"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>
                              📍{" "}
                              {job.location?.display_name ||
                                "Location not specified"}
                            </span>

                            <span>💰 {formatSalary(job)}</span>

                            {job.contract_type && (
                              <span>💼 {job.contract_type}</span>
                            )}
                          </div>

                          {job.description && (
                            <p className="mt-3 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-500">
                              {job.description.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {job.redirect_url ? (
                            <a
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-lg bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
                            >
                              View & Apply
                            </a>
                          ) : (
                            <span className="text-xs text-slate-600">
                              Application link unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Auto Apply */}
            <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5 lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Auto Apply</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Apply automatically to eligible jobs.
                  </p>
                </div>

                <button
                  onClick={() => setAutoApply(!autoApply)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium ${
                    autoApply
                      ? "bg-cyan-400/10 text-cyan-400"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {autoApply ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Copyright */}
            <p className="mt-8 pb-4 text-center text-xs text-slate-600">
              © 2026 JobBot by JAMPANA ARAVIND KUMAR
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}