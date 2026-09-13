"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { Icon } from "../components/icons";
import { EmptyState, MetricCard, PageIntro, ScoreRing } from "../components/product-ui";

type Job = { id: string; title: string; company: string; location: string; description: string; url: string; salary?: string; matchPercentage: number; matchedKeywords: string[] };

export default function MatchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<"all" | "strong" | "saved">("all");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      setJobs(JSON.parse(window.sessionStorage.getItem("jobbot.latest-jobs") ?? "[]") as Job[]);
      setSaved(JSON.parse(window.localStorage.getItem("jobbot.saved-jobs") ?? "[]") as string[]);
    } catch {
      setJobs([]);
    }
  }, []);

  const visibleJobs = useMemo(() => jobs.filter((job) => filter === "all" || (filter === "strong" ? job.matchPercentage >= 70 : saved.includes(job.id))).sort((a, b) => b.matchPercentage - a.matchPercentage), [filter, jobs, saved]);
  const strongMatches = jobs.filter((job) => job.matchPercentage >= 70).length;

  function toggleSave(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((jobId) => jobId !== id) : [...current, id];
      window.localStorage.setItem("jobbot.saved-jobs", JSON.stringify(next));
      return next;
    });
  }

  return <AppShell><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
    <PageIntro eyebrow="Role intelligence" title="Matches built around you." description="Every listing is ranked against the preferences and resume from your most recent search." action={<Link href="/resume" className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"><Icon name="search" className="h-4 w-4" />New search</Link>} />
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><MetricCard label="All matches" value={jobs.length} detail="From your latest search" icon="search" /><MetricCard label="Strong fit" value={strongMatches} detail="Ranked 70% or higher" icon="target" accent="emerald" /><MetricCard label="Saved" value={saved.length} detail="Available for later review" icon="file" accent="violet" /></section>
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{([ ["all", "All matches"], ["strong", "70%+ match"], ["saved", "Saved"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${filter === value ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"}`}>{label}</button>)}</div><p className="flex items-center gap-2 text-xs text-[var(--text-faint)]"><Icon name="filter" className="h-3.5 w-3.5" />Sorted by best fit</p></div></section>
    <section className="mt-5">{visibleJobs.length === 0 ? <EmptyState icon="target" title={jobs.length ? "Nothing in this view yet" : "Your matches will appear here"} description={jobs.length ? "Try a different filter, or save a role you want to revisit." : "Complete a job search with your resume to see matching roles, relevant skills, and next steps."} action={<Link href="/resume" className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-slate-950">Find matching jobs</Link>} /> : <div className="space-y-4">{visibleJobs.map((job) => <article key={job.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] transition hover:border-[var(--border-strong)] sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><ScoreRing score={job.matchPercentage} /><div className="min-w-0 flex-1"><div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div><h2 className="text-lg font-bold">{job.title}</h2><p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{job.company}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-faint)]"><span className="flex items-center gap-1.5"><Icon name="location" className="h-3.5 w-3.5" />{job.location}</span>{job.salary && <span>{job.salary}</span>}</div></div><button type="button" onClick={() => toggleSave(job.id)} className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${saved.includes(job.id) ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"}`}><Icon name="file" className="h-3.5 w-3.5" />{saved.includes(job.id) ? "Saved" : "Save"}</button></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">{job.description}</p><div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Matching skills</span>{job.matchedKeywords.slice(0, 6).map((keyword) => <span key={keyword} className="rounded-md bg-[var(--brand-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--brand)]">{keyword}</span>)}</div><div className="mt-5 flex flex-wrap gap-2">{job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110">View & apply <Icon name="arrow" className="h-4 w-4" /></a>}<Link href="/auto-apply" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-hover)]">Auto-apply settings <Icon name="chevron" className="h-4 w-4" /></Link></div></div></div></article>)}</div>}</section>
  </div></AppShell>;
}
