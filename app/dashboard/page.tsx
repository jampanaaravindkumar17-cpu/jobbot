"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { Icon } from "../components/icons";
import { EmptyState, MetricCard, PageIntro, ScoreRing } from "../components/product-ui";

type StoredJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchPercentage: number;
  matchedKeywords?: string[];
};

type ResumeSummary = { fileName?: string; characters?: number };

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<StoredJob[]>([]);
  const [resume, setResume] = useState<ResumeSummary | null>(null);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    setJobs(readJson<StoredJob[]>("jobbot.latest-jobs", []));
    setResume(readJson<ResumeSummary | null>("jobbot.resume-summary", null));
  }, []);

  const highMatches = useMemo(() => jobs.filter((job) => job.matchPercentage >= 70), [jobs]);
  const averageMatch = useMemo(() => jobs.length ? Math.round(jobs.reduce((total, job) => total + job.matchPercentage, 0) / jobs.length) : 0, [jobs]);

  function startSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.sessionStorage.setItem("jobbot.search-draft", JSON.stringify({ role, location }));
    router.push("/resume");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <PageIntro
          eyebrow="Sunday, 13 September"
          title="Good morning, Aravind."
          description="Your career command center: discover roles, see how you match, and keep every next step in view."
          action={<Link href="/resume" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:brightness-110"><Icon name="search" className="h-4 w-4" />Find jobs</Link>}
        />

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Jobs found" value={jobs.length} detail={jobs.length ? "From your latest search" : "Start a search to populate"} icon="search" />
          <MetricCard label="Strong matches" value={highMatches.length} detail={highMatches.length ? "Matches above 70%" : "No high matches yet"} icon="target" accent="emerald" />
          <MetricCard label="Average match" value={averageMatch ? `${averageMatch}%` : "—"} detail={averageMatch ? "Across your latest results" : "Calculated after you search"} icon="chart" accent="violet" />
          <MetricCard label="Resume" value={resume ? "Ready" : "Needed"} detail={resume?.fileName ?? "Upload PDF or DOCX to match"} icon="file" accent={resume ? "emerald" : "orange"} />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.78fr)]">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
            <div className="relative overflow-hidden border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon name="search" className="h-5 w-5" /></span><div><h2 className="font-bold">Start with a focused search</h2><p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">Set a role and location, then match real openings against your resume.</p></div></div>
            </div>
            <form onSubmit={startSearch} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6">
              <label className="group rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-2.5 transition focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-cyan-500/10"><span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)]"><Icon name="briefcase" className="h-3.5 w-3.5" />Target role</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Data analyst" className="mt-1 w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-faint)]" /></label>
              <label className="group rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-2.5 transition focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-cyan-500/10"><span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)]"><Icon name="location" className="h-3.5 w-3.5" />Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Bengaluru" className="mt-1 w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-faint)]" /></label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 sm:self-stretch"><span>Continue</span><Icon name="arrow" className="h-4 w-4" /></button>
            </form>
            <div className="mx-5 mb-5 flex flex-wrap gap-2 sm:mx-6 sm:mb-6"><span className="text-xs text-[var(--text-faint)]">You&apos;ll add experience, job type, and your resume next.</span></div>
          </div>

          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Automation</p><h2 className="mt-1 font-bold">Apply with control</h2></div><span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Safe mode</span></div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">JobBot can prepare a queue only for the roles you approve. It pauses whenever a verification or CAPTCHA needs you.</p>
            <Link href="/auto-apply" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] hover:underline">Review auto-apply settings <Icon name="arrow" className="h-4 w-4" /></Link>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.78fr)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="font-bold">Recent matched jobs</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Your latest roles, ranked by fit.</p></div>{jobs.length > 0 && <Link href="/matches" className="text-sm font-bold text-[var(--brand)] hover:underline">View all</Link>}</div>
            {jobs.length === 0 ? <div className="mt-5"><EmptyState icon="target" title="No matches yet" description="Add your role, location, and resume to see exactly where you fit." action={<Link href="/resume" className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-slate-950">Set up your search</Link>} /></div> : <div className="mt-5 divide-y divide-[var(--border)]">{jobs.slice(0, 3).map((job) => <Link href="/matches" key={job.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 transition hover:opacity-80"><ScoreRing score={job.matchPercentage} /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{job.title}</h3><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{job.company} · {job.location}</p><div className="mt-2 flex flex-wrap gap-1.5">{job.matchedKeywords?.slice(0, 2).map((skill) => <span key={skill} className="rounded-md bg-[var(--brand-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brand)]">{skill}</span>)}</div></div><Icon name="chevron" className="h-4 w-4 text-[var(--text-faint)]" /></Link>)}</div>}
          </div>

          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] sm:p-6"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Your progress</p><h2 className="mt-1 font-bold">Get match-ready</h2><div className="mt-5 space-y-4">{[{ label: "Set preferences", done: true }, { label: "Upload your resume", done: Boolean(resume) }, { label: "Review recommended jobs", done: jobs.length > 0 }].map((step, index) => <div key={step.label} className="flex gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${step.done ? "bg-emerald-500 text-white" : "border border-[var(--border-strong)] text-[var(--text-faint)]"}`}>{step.done ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}</span><div><p className={`text-sm font-semibold ${step.done ? "" : "text-[var(--text-muted)]"}`}>{step.label}</p><p className="mt-0.5 text-xs text-[var(--text-faint)]">{step.done ? "Complete" : index === 1 ? "Required for personalized matching" : "Waiting on earlier steps"}</p></div></div>)}</div><Link href="/resume" className="mt-6 inline-flex text-sm font-bold text-[var(--brand)] hover:underline">Complete setup <Icon name="arrow" className="inline h-4 w-4" /></Link></aside>
        </section>
      </div>
    </AppShell>
  );
}
