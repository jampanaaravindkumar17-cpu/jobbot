"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { Icon } from "../components/icons";
import { PageIntro } from "../components/product-ui";

type Plan = "Free" | "Pro" | "Premium";
const plans: { name: Plan; price: string; description: string; features: string[] }[] = [
  { name: "Free", price: "₹0", description: "A focused start for your search.", features: ["Resume matching", "Up to 5 saved jobs", "Application tracker"] },
  { name: "Pro", price: "₹499", description: "More search power and automation controls.", features: ["Everything in Free", "Unlimited saved jobs", "Auto-apply guardrails", "Priority match alerts"] },
  { name: "Premium", price: "₹999", description: "A complete job-search command center.", features: ["Everything in Pro", "Multiple role tracks", "Advanced application insights", "Priority support"] },
];

export default function PlansPage() {
  const [selected, setSelected] = useState<Plan>("Free");
  useEffect(() => { const saved = window.localStorage.getItem("jobbot.plan") as Plan | null; if (saved && plans.some((plan) => plan.name === saved)) setSelected(saved); }, []);
  function choose(plan: Plan) { setSelected(plan); window.localStorage.setItem("jobbot.plan", plan); }
  return <AppShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10"><PageIntro eyebrow="Plans & billing" title="Choose the pace that suits your search." description="Your plan selection is stored locally while billing integration is connected. You will never be charged from this screen." />
    <div className="mt-8 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <section key={plan.name} className={`relative rounded-2xl border p-6 shadow-[var(--card-shadow)] ${selected === plan.name ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>{plan.name === "Pro" && <span className="absolute -top-3 left-6 rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">Most popular</span>}<p className="text-sm font-bold text-[var(--brand)]">{plan.name}</p><p className="mt-3 text-3xl font-bold">{plan.price}<span className="text-sm font-medium text-[var(--text-muted)]"> / month</span></p><p className="mt-3 min-h-11 text-sm leading-5 text-[var(--text-muted)]">{plan.description}</p><ul className="mt-6 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{feature}</li>)}</ul><button type="button" onClick={() => choose(plan.name)} className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${selected === plan.name ? "bg-[var(--brand)] text-slate-950" : "border border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"}`}>{selected === plan.name ? "Selected" : `Choose ${plan.name}`}</button></section>)}</div>
    <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text-muted)] shadow-[var(--card-shadow)]"><span className="font-bold text-[var(--text)]">Billing history</span><p className="mt-2">No invoices yet. Payment and invoice history will appear here once a billing provider is connected.</p></div>
  </div></AppShell>;
}
