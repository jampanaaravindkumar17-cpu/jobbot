"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { Icon } from "../components/icons";
import { EmptyState, MetricCard, PageIntro } from "../components/product-ui";

type Status = "Applied" | "In review" | "Interview" | "Rejected";
type Application = { id: string; role: string; company: string; status: Status; date: string };
const statuses: Status[] = ["Applied", "In review", "Interview", "Rejected"];

const badgeStyles: Record<Status, string> = { Applied: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300", "In review": "bg-violet-500/12 text-violet-600 dark:text-violet-300", Interview: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300", Rejected: "bg-rose-500/12 text-rose-600 dark:text-rose-300" };

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("Applied");

  useEffect(() => {
    try { setApplications(JSON.parse(window.localStorage.getItem("jobbot.applications") ?? "[]") as Application[]); } catch { setApplications([]); }
  }, []);

  const metrics = useMemo(() => statuses.reduce((all, item) => ({ ...all, [item]: applications.filter((application) => application.status === item).length }), {} as Record<Status, number>), [applications]);

  function persist(next: Application[]) { setApplications(next); window.localStorage.setItem("jobbot.applications", JSON.stringify(next)); }
  function addApplication(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!role.trim() || !company.trim()) return; persist([{ id: crypto.randomUUID(), role: role.trim(), company: company.trim(), status, date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date()) }, ...applications]); setRole(""); setCompany(""); setStatus("Applied"); setShowForm(false); }
  function updateStatus(id: string, nextStatus: Status) { persist(applications.map((application) => application.id === id ? { ...application, status: nextStatus } : application)); }

  return <AppShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10"><PageIntro eyebrow="Application tracker" title="Keep every application moving." description="Log applications you complete and see the next action for each opportunity in one focused view." action={<button type="button" onClick={() => setShowForm((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"><Icon name={showForm ? "close" : "arrow"} className="h-4 w-4" />{showForm ? "Close" : "Log application"}</button>} />
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Applied" value={metrics.Applied} detail="Ready for follow-up" icon="file" /><MetricCard label="In review" value={metrics["In review"]} detail="With the employer" icon="chart" accent="violet" /><MetricCard label="Interviews" value={metrics.Interview} detail="Upcoming conversations" icon="calendar" accent="emerald" /><MetricCard label="Closed" value={metrics.Rejected} detail="For future reference" icon="close" accent="orange" /></section>
    {showForm && <form onSubmit={addApplication} className="mt-7 grid gap-3 rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] p-5 sm:grid-cols-[1fr_1fr_180px_auto]"><label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Role</span><input required value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Product designer" className="mt-1 w-full bg-transparent text-sm outline-none" /></label><label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Company</span><input required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" className="mt-1 w-full bg-transparent text-sm outline-none" /></label><label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Status</span><select value={status} onChange={(event) => setStatus(event.target.value as Status)} className="mt-1 w-full bg-transparent text-sm outline-none">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit" className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-slate-950 hover:brightness-110">Save</button></form>}
    <section className="mt-7">{applications.length === 0 ? <EmptyState icon="briefcase" title="No applications tracked yet" description="When you apply to a role, log it here so your job hunt never loses its thread." action={<button type="button" onClick={() => setShowForm(true)} className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-slate-950">Log your first application</button>} /> : <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)]"><div className="hidden grid-cols-[1.2fr_1fr_140px_110px] gap-4 border-b border-[var(--border)] px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)] sm:grid"><span>Role</span><span>Company</span><span>Status</span><span>Applied</span></div>{applications.map((application) => <article key={application.id} className="grid gap-3 border-b border-[var(--border)] px-5 py-4 last:border-0 sm:grid-cols-[1.2fr_1fr_140px_110px] sm:items-center sm:px-6"><div><p className="text-sm font-bold">{application.role}</p><p className="mt-1 text-xs text-[var(--text-faint)] sm:hidden">{application.company}</p></div><p className="hidden text-sm text-[var(--text-muted)] sm:block">{application.company}</p><select aria-label={`Status for ${application.role}`} value={application.status} onChange={(event) => updateStatus(application.id, event.target.value as Status)} className={`w-fit rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none ${badgeStyles[application.status]}`}><option>Applied</option><option>In review</option><option>Interview</option><option>Rejected</option></select><p className="text-xs text-[var(--text-faint)]">{application.date}</p></article>)}</div>}</section>
  </div></AppShell>;
}
