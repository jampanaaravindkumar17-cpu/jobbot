"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

type NavItem = { href: string; label: string; icon: IconName; badge?: string };

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/resume", label: "Find jobs", icon: "search" },
  { href: "/resume", label: "Resume", icon: "file" },
  { href: "/matches", label: "Matches", icon: "target" },
  { href: "/auto-apply", label: "Auto apply", icon: "bolt", badge: "Safe" },
  { href: "/applications", label: "Applications", icon: "briefcase" },
];

const secondaryNav: NavItem[] = [
  { href: "/alerts", label: "Alerts", icon: "bell" },
  { href: "/plans", label: "Plans & billing", icon: "chart" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/resume": "Find jobs",
  "/matches": "Matches",
  "/auto-apply": "Auto apply",
  "/applications": "Applications",
  "/alerts": "Alerts",
  "/plans": "Plans & billing",
  "/settings": "Settings",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("jobbot.theme");
    setLightMode(savedTheme === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", lightMode);
    window.localStorage.setItem("jobbot.theme", lightMode ? "light" : "dark");
  }, [lightMode]);

  const isActive = (href: string) => {
    if (href === "/resume") return pathname === "/resume";
    return pathname === href;
  };

  const nav = (items: NavItem[]) => items.map((item) => (
    <Link
      key={`${item.href}-${item.label}`}
      href={item.href}
      onClick={() => setMenuOpen(false)}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive(item.href)
          ? "bg-[var(--brand-soft)] text-[var(--brand)] shadow-sm"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      }`}
    >
      <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && <span className="rounded-md bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-500">{item.badge}</span>}
    </Link>
  ));

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-[var(--border)] bg-[color:var(--app-bg)/0.82] px-4 backdrop-blur-xl lg:left-[264px] lg:px-8">
        <button type="button" onClick={() => setMenuOpen(true)} className="mr-3 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] lg:hidden" aria-label="Open navigation">
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">Workspace</p>
          <p className="text-sm font-semibold">{pageTitles[pathname] ?? "JobBot"}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setLightMode((current) => !current)} className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]" aria-label={lightMode ? "Use dark theme" : "Use light theme"}>
            <Icon name={lightMode ? "moon" : "sun"} className="h-4 w-4" />
          </button>
          <Link href="/alerts" className="relative rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]" aria-label="View alerts">
            <Icon name="bell" className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
          </Link>
          <Link href="/settings" className="ml-1 flex items-center gap-2 rounded-xl px-1.5 py-1 text-left transition hover:bg-[var(--surface-hover)]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#25c6e8,#4f46e5)] text-xs font-bold text-white">A</span>
            <span className="hidden pr-2 sm:block"><span className="block text-xs font-semibold">Aravind</span><span className="block text-[10px] text-[var(--text-faint)]">Job seeker</span></span>
          </Link>
        </div>
      </header>

      {menuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] px-3 py-5 transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between px-3">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#22c3e6,#4f46e5)] shadow-lg shadow-cyan-500/20"><Icon name="sparkles" className="h-5 w-5 text-white" /></span>
            <span><span className="block text-base font-bold tracking-tight">JobBot</span><span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand)]">Career command</span></span>
          </Link>
          <button type="button" className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><Icon name="close" className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1" aria-label="Primary navigation">{nav(primaryNav)}</nav>
        <div className="my-5 border-t border-[var(--border)]" />
        <nav className="space-y-1" aria-label="Secondary navigation">{nav(secondaryNav)}</nav>
        <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--brand-soft),transparent)] p-4">
          <div className="flex items-center gap-2 text-[var(--brand)]"><Icon name="sparkles" className="h-4 w-4" /><span className="text-xs font-bold">Make your profile stronger</span></div>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">A tailored resume can improve your job match quality.</p>
          <Link href="/resume" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--text)] hover:text-[var(--brand)]">Update resume <Icon name="arrow" className="h-3.5 w-3.5" /></Link>
        </div>
      </aside>
      <main className="min-h-screen pt-16 lg:pl-[264px]">{children}</main>
    </div>
  );
}
