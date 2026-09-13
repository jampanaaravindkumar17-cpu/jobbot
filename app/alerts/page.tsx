"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { Icon } from "../components/icons";
import { EmptyState, PageIntro } from "../components/product-ui";

type AlertSettings = { highMatches: boolean; applicationUpdates: boolean; humanAction: boolean };
const defaults: AlertSettings = { highMatches: true, applicationUpdates: true, humanAction: true };

export default function AlertsPage() {
  const [settings, setSettings] = useState<AlertSettings>(defaults);
  useEffect(() => { try { setSettings({ ...defaults, ...JSON.parse(window.localStorage.getItem("jobbot.alert-settings") ?? "{}") }); } catch { /* Keep defaults. */ } }, []);
  function toggle(key: keyof AlertSettings) { setSettings((current) => { const next = { ...current, [key]: !current[key] }; window.localStorage.setItem("jobbot.alert-settings", JSON.stringify(next)); return next; }); }
  const choices: { key: keyof AlertSettings; title: string; description: string; icon: "target" | "briefcase" | "user" }[] = [
    { key: "highMatches", title: "High-match jobs", description: "Get notified when a new role clears your match threshold.", icon: "target" },
    { key: "applicationUpdates", title: "Application updates", description: "Keep track of changes you log in your application tracker.", icon: "briefcase" },
    { key: "humanAction", title: "Human action required", description: "Always notify when an automation needs your attention.", icon: "user" },
  ];
  return <AppShell><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10"><PageIntro eyebrow="Notifications" title="Keep only the alerts that matter." description="Choose how JobBot should surface meaningful changes in your job search." />
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)]">{choices.map((choice) => <div key={choice.key} className="flex items-center gap-4 border-b border-[var(--border)] p-5 last:border-0 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon name={choice.icon} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{choice.title}</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{choice.description}</p></div><button type="button" onClick={() => toggle(choice.key)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings[choice.key] ? "bg-[var(--brand)]" : "bg-slate-400/40"}`} aria-label={`Toggle ${choice.title}`} aria-pressed={settings[choice.key]}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings[choice.key] ? "left-6" : "left-1"}`} /></button></div>)}</section><aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Today</p><h2 className="mt-1 font-bold">All caught up</h2><p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">There are no new match, application, or automation updates to review.</p></aside></div>
    <div className="mt-6"><EmptyState icon="bell" title="A quiet inbox is a good inbox" description="As you search and track applications, meaningful updates will collect here." /></div>
  </div></AppShell>;
}
