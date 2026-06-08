"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Clock3,
  CreditCard,
  Download,
  FolderKanban,
  Info,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  UserRound,
  Users,
  Workflow,
  X,
  type LucideIcon
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { EnvironmentNotifier } from "@/components/environment-notifier";
import { NotificationMenu } from "@/components/notification-menu";
import { StatusPulse } from "@/components/status-pulse";
import { ToastProvider } from "@/components/toast-provider";
import type { ServerEnvStatus } from "@/lib/env";

const SIDEBAR_STORAGE_KEY = "worklog-sidebar-state";
const THEME_STORAGE_KEY = "worklog-theme";

type SidebarState = "collapsed" | "expanded";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  path: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, path: "/" },
  { label: "Projetos", href: "/projects", icon: FolderKanban, path: "/projects" },
  {
    label: "Operações",
    href: "/operations",
    icon: BriefcaseBusiness,
    path: "/operations"
  },
  { label: "Clientes", href: "/clients", icon: Users, path: "/clients" },
  { label: "Registros", href: "/records", icon: Clock3, path: "/records" },
  { label: "Pagamentos", href: "/payments", icon: CreditCard, path: "/payments" },
  {
    label: "Notificações",
    href: "/notifications",
    icon: Bell,
    path: "/notifications"
  },
  { label: "Perfil", href: "/profile", icon: UserRound, path: "/profile" },
  { label: "Fluxo", href: "/flow", icon: Workflow, path: "/flow" },
  { label: "Instalação", href: "/installation", icon: Download, path: "/installation" },
  { label: "Sobre", href: "/about", icon: Info, path: "/about" }
];

function getPreference(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

function applyPreference(key: string, value: string) {
  if (key === SIDEBAR_STORAGE_KEY) {
    document.documentElement.dataset.sidebar = value;
    document.documentElement.style.setProperty(
      "--sidebar-width",
      value === "collapsed" ? "84px" : "288px"
    );
  }

  if (key === THEME_STORAGE_KEY) {
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", value === "light" ? "#f4f6f8" : "#090909");
  }
}

function setPreference(key: string, value: string) {
  window.localStorage.setItem(key, value);
  applyPreference(key, value);

  window.dispatchEvent(new Event(`worklog-storage:${key}`));
}

function subscribeToPreference(key: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === key && event.newValue) {
      applyPreference(key, event.newValue);
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(`worklog-storage:${key}`, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(`worklog-storage:${key}`, callback);
  };
}

function useStoredPreference(key: string, fallback: string) {
  return useSyncExternalStore(
    (callback) => subscribeToPreference(key, callback),
    () => getPreference(key, fallback),
    () => fallback
  );
}

function CompactTooltip({ children }: { children: ReactNode }) {
  return (
    <span className="sidebar-collapsed-tooltip pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[140] -translate-y-1/2 whitespace-nowrap rounded-md border border-[color:var(--border)] bg-[var(--tooltip-bg)] px-2.5 py-1.5 text-xs text-white shadow-2xl shadow-black/35">
      {children}
    </span>
  );
}

function NavLink({
  active,
  item,
  onSelect
}: {
  active: boolean;
  item: NavItem;
  onSelect?: () => void;
}) {
  const Icon = item.icon;

  function handleClick() {
    onSelect?.();
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={[
        "sidebar-nav-link group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-200",
        active
          ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm shadow-black/10"
          : "text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
      ].join(" ")}
      href={item.href}
      onClick={handleClick}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span className="sidebar-nav-label truncate">{item.label}</span>
      <CompactTooltip>{item.label}</CompactTooltip>
    </Link>
  );
}

function EnvPanel({ envStatus }: { envStatus: ServerEnvStatus }) {
  return (
    <>
      <div className="sidebar-env-panel sidebar-expanded-only min-w-0 flex-col rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
          Ambiente
        </p>
        <p className="mt-2 min-w-0 truncate text-sm font-medium">
          {envStatus.configured ? "Variáveis configuradas" : "Variáveis pendentes"}
        </p>
        <div className="mt-4 min-w-0 space-y-2.5">
          {Object.entries(envStatus.keys).map(([key, check]) => (
            <div
              className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)_max-content] items-center gap-2.5 text-xs"
              key={key}
            >
              <StatusPulse tone={check.tone} />
              <span className="min-w-0 truncate font-mono text-[11px] text-[color:var(--text-muted)]">
                {key}
              </span>
              <span className="shrink-0 text-right text-[color:var(--text-soft)]">
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-collapsed-only sidebar-compact-control group relative z-[90] mx-auto size-11 items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)]">
        <StatusPulse tone={envStatus.configured ? "success" : "error"} />
        <CompactTooltip>
          {envStatus.configured ? "Variáveis configuradas" : "Variáveis pendentes"}
        </CompactTooltip>
      </div>
    </>
  );
}

function ThemeControl({
  className = "",
  onToggle
}: {
  className?: string;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label="Alternar tema"
      className={[
        "h-11 items-center justify-between gap-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 text-[color:var(--text-muted)] transition-colors duration-200 hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]",
        className
      ].join(" ")}
      onClick={onToggle}
      title="Alternar tema"
      type="button"
    >
      <Moon className="theme-dark-only size-[18px] shrink-0" strokeWidth={1.8} />
      <Sun className="theme-light-only size-[18px] shrink-0" strokeWidth={1.8} />
      <span
        aria-hidden
        className="theme-toggle-track relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
      >
        <span
          className="theme-toggle-knob absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-[var(--app-text-strong)] shadow-sm transition-[left] duration-200"
        />
      </span>
    </button>
  );
}

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <>
      <ThemeControl className="sidebar-expanded-only" onToggle={onToggle} />

      <button
        aria-label="Alternar tema"
        className="sidebar-collapsed-only sidebar-compact-control group relative mx-auto size-11 items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
        onClick={onToggle}
        title="Alternar tema"
        type="button"
      >
        <Moon className="theme-dark-only size-4" strokeWidth={1.8} />
        <Sun className="theme-light-only size-4" strokeWidth={1.8} />
        <CompactTooltip>
          <span className="theme-dark-only">Tema claro</span>
          <span className="theme-light-only">Tema escuro</span>
        </CompactTooltip>
      </button>
    </>
  );
}

export function AppShell({
  children,
  envStatus
}: {
  children: ReactNode;
  envStatus: ServerEnvStatus;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const sidebarState = useStoredPreference(SIDEBAR_STORAGE_KEY, "expanded") as SidebarState;
  const collapsed = sidebarState === "collapsed";

  function handleSidebarToggle() {
    setPreference(SIDEBAR_STORAGE_KEY, collapsed ? "expanded" : "collapsed");
  }

  function handleThemeToggle() {
    const currentTheme =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setPreference(THEME_STORAGE_KEY, currentTheme === "dark" ? "light" : "dark");
  }

  function isNavItemActive(item: NavItem) {
    return pathname === item.path;
  }

  return (
    <ToastProvider>
      <EnvironmentNotifier envStatus={envStatus} />
      <main className="min-h-screen bg-[var(--app-bg)] text-[color:var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--ambient-gradient)]" />
      <div className="pointer-events-none fixed inset-0 bg-[var(--grid-pattern)] bg-[size:72px_72px]" />

      <div className="relative flex min-h-screen">
        <aside className="worklog-sidebar sticky top-0 z-[70] hidden h-screen shrink-0 isolate flex-col overflow-visible border-r border-[color:var(--border)] bg-[var(--sidebar-bg)] backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex">
          <div className="group flex h-[72px] items-center border-b border-[color:var(--border)] px-3">
            <div className="sidebar-expanded-only min-w-0 flex-1 items-center gap-3">
              <Link
                aria-label="WorkLog"
                className="flex min-w-0 flex-1 items-center px-1"
                href="/"
              >
                <BrandLogo className="min-w-0" />
              </Link>
              <button
                aria-label="Recolher navegação"
                className="grid size-10 shrink-0 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors duration-200 hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                onClick={handleSidebarToggle}
                title="Recolher"
                type="button"
              >
                <PanelLeftClose className="size-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="sidebar-collapsed-only relative mx-auto size-11 items-center justify-center">
              <Link
                aria-label="WorkLog"
                className="grid size-11 place-items-center transition-opacity duration-200 group-hover:opacity-0"
                href="/"
              >
                <BrandLogo iconClassName="size-[22px]" showName={false} />
              </Link>
              <button
                aria-label="Expandir navegação"
                className="absolute inset-0 grid size-11 place-items-center rounded-md border border-transparent bg-[var(--hover-bg)] text-[color:var(--app-text-strong)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={handleSidebarToggle}
                title="Expandir"
                type="button"
              >
                <PanelLeftOpen className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <nav className="sidebar-nav-area min-h-0 flex-1 space-y-0.5 overflow-visible px-3 py-2">
            {navItems.map((item) => (
              <NavLink active={isNavItemActive(item)} item={item} key={item.label} />
            ))}
          </nav>

          <div className="sidebar-footer shrink-0 space-y-3 overflow-visible px-3 pb-4">
            <div className="sidebar-controls-row">
              <NotificationMenu className="sidebar-notif" />
              <ThemeToggle onToggle={handleThemeToggle} />
            </div>
            <EnvPanel envStatus={envStatus} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between border-b border-[color:var(--border)] bg-[var(--header-bg)] px-5 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
            <Link aria-label="WorkLog" href="/">
              <BrandLogo />
            </Link>
            <div className="flex items-center gap-2">
              <button
                aria-label="Alternar tema"
                className="grid size-10 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                onClick={handleThemeToggle}
                type="button"
              >
                <Sun className="theme-dark-only size-5" />
                <Moon className="theme-light-only size-5" />
              </button>
              <button
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                className="grid size-10 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                onClick={() => setMobileOpen((value) => !value)}
                type="button"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </header>

          <button
            aria-label="Fechar menu"
            className={[
              "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
            ].join(" ")}
            onClick={() => setMobileOpen(false)}
            type="button"
          />

          <aside
            className={[
              "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[332px] flex-col border-r border-[color:var(--border)] bg-[var(--sidebar-solid)] shadow-2xl shadow-black/20 transition-transform duration-300 ease-out lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            ].join(" ")}
          >
            <div className="flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between border-b border-[color:var(--border)] px-5 pt-[env(safe-area-inset-top)]">
              <Link aria-label="WorkLog" href="/" onClick={() => setMobileOpen(false)}>
                <BrandLogo />
              </Link>
              <button
                aria-label="Fechar menu"
                className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)]"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
              {navItems.map((item) => (
                <NavLink
                  active={isNavItemActive(item)}
                  item={item}
                  key={item.label}
                  onSelect={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-3 px-4 pb-5">
              <div className="flex items-center gap-2">
                <NotificationMenu className="flex-1 min-w-0" mobile />
                <ThemeControl className="flex shrink-0" onToggle={handleThemeToggle} />
              </div>
              <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                  Ambiente
                </p>
                <p className="mt-2 text-sm font-medium">
                  {envStatus.configured ? "Variáveis configuradas" : "Variáveis pendentes"}
                </p>
                <div className="mt-4 space-y-2.5">
                  {Object.entries(envStatus.keys).map(([key, check]) => (
                    <div
                      className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)_max-content] items-center gap-2.5 text-xs"
                      key={key}
                    >
                      <StatusPulse tone={check.tone} />
                      <span className="min-w-0 truncate font-mono text-[11px] text-[color:var(--text-muted)]">
                        {key}
                      </span>
                      <span className="shrink-0 text-right text-[color:var(--text-soft)]">
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="relative mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            {children}
          </section>
        </div>
      </div>
      </main>
    </ToastProvider>
  );
}
