import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">{eyebrow ?? "JobBot workspace"}</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{description}</p></div>{action}</div>;
}

export function MetricCard({ label, value, detail, icon, accent = "cyan" }: { label: string; value: string | number; detail: string; icon: IconName; accent?: "cyan" | "violet" | "emerald" | "orange" }) {
  const colors = { cyan: "bg-cyan-500/12 text-cyan-500", violet: "bg-violet-500/12 text-violet-500", emerald: "bg-emerald-500/12 text-emerald-500", orange: "bg-orange-500/12 text-orange-500" };
  return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)]"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p></div><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[accent]}`}><Icon name={icon} className="h-[18px] w-[18px]" /></span></div><p className="mt-3 text-xs text-[var(--text-faint)]">{detail}</p></div>;
}

export function EmptyState({ icon, title, description, action }: { icon: IconName; title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] px-6 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon name={icon} className="h-6 w-6" /></span><h2 className="mt-4 text-base font-bold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function ScoreRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return <div className="relative h-14 w-14"><svg viewBox="0 0 52 52" className="h-full w-full -rotate-90"><circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-[var(--surface-hover)]" /><circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={score >= 75 ? "text-emerald-500" : "text-[var(--brand)]"} /></svg><span className="absolute inset-0 grid place-items-center text-[11px] font-bold">{score}%</span></div>;
}
