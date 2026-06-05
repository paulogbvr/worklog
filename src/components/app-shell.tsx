"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Clock3,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Users,
  X,
  type LucideIcon
} from "lucide-react";

const SIDEBAR_STORAGE_KEY = "worklog-sidebar-state";
const THEME_STORAGE_KEY = "worklog-theme";

type Theme = "dark" | "light";
type SidebarState = "collapsed" | "expanded";

type EnvStatus = {
  configured: boolean;
  keys: Record<string, boolean>;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard, active: true },
  { label: "Projetos", href: "#projetos", icon: FolderKanban },
  { label: "Clientes", href: "#clientes", icon: Users },
  { label: "Registros", href: "#registros", icon: Clock3 },
  { label: "Pagamentos", href: "#pagamentos", icon: CreditCard }
];

function getPreference(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

function setPreference(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(`worklog-storage:${key}`));
}

function subscribeToPreference(key: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === key) {
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

function NavLink({
  item,
  collapsed,
  onSelect
}: {
  item: NavItem;
  collapsed?: boolean;
  onSelect?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={item.active ? "page" : undefined}
      className={[
        "group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-200",
        collapsed ? "justify-center" : "justify-start",
        item.active
          ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm shadow-black/10"
          : "text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
      ].join(" ")}
      href={item.href}
      onClick={onSelect}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>

      {collapsed ? (
        <span className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[120] hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[color:var(--border)] bg-[var(--tooltip-bg)] px-2.5 py-1.5 text-xs text-white shadow-2xl shadow-black/35 group-hover:block">
          {item.label}
        </span>
      ) : null}
    </Link>
  );
}

function EnvPanel({
  envStatus,
  collapsed
}: {
  envStatus: EnvStatus;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <div className="group relative z-[90] mx-auto grid size-11 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)]">
        <span
          className={[
            "size-2 rounded-full",
            envStatus.configured ? "bg-[var(--success)]" : "bg-[var(--warning)]"
          ].join(" ")}
        />
        <span className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[120] hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[color:var(--border)] bg-[var(--tooltip-bg)] px-2.5 py-1.5 text-xs text-white shadow-2xl shadow-black/35 group-hover:block">
          {envStatus.configured ? "Variáveis configuradas" : "Variáveis pendentes"}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-faint)]">Ambiente</p>
      <p className="mt-2 text-sm font-medium">
        {envStatus.configured ? "Variáveis configuradas" : "Variáveis pendentes"}
      </p>
      <div className="mt-4 space-y-2">
        {Object.entries(envStatus.keys).map(([key, configured]) => (
          <div className="flex items-center justify-between gap-4 text-xs" key={key}>
            <span className="truncate text-[color:var(--text-muted)]">{key}</span>
            <span className={configured ? "text-[color:var(--success)]" : "text-[color:var(--warning)]"}>
              {configured ? "ok" : "pendente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeToggle({
  collapsed,
  theme,
  onToggle
}: {
  collapsed?: boolean;
  theme: Theme;
  onToggle: () => void;
}) {
  const isLight = theme === "light";
  const Icon = isLight ? Moon : Sun;
  const label = isLight ? "Ativar tema escuro" : "Ativar tema claro";

  if (collapsed) {
    return (
      <button
        aria-label={label}
        className="group relative mx-auto grid size-11 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
        onClick={onToggle}
        title={label}
        type="button"
      >
        <Icon className="size-4" strokeWidth={1.8} />
        <span className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[120] hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[color:var(--border)] bg-[var(--tooltip-bg)] px-2.5 py-1.5 text-xs text-white shadow-2xl shadow-black/35 group-hover:block">
          {isLight ? "Tema escuro" : "Tema claro"}
        </span>
      </button>
    );
  }

  return (
    <button
      className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
      onClick={onToggle}
      type="button"
    >
      <span className="flex items-center gap-3">
        <Icon className="size-4" strokeWidth={1.8} />
        {isLight ? "Tema escuro" : "Tema claro"}
      </span>
      <span className="text-xs text-[color:var(--text-faint)]">{isLight ? "light" : "dark"}</span>
    </button>
  );
}

export function AppShell({
  children,
  envStatus
}: {
  children: ReactNode;
  envStatus: EnvStatus;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarState = useStoredPreference(SIDEBAR_STORAGE_KEY, "expanded") as SidebarState;
  const storedTheme = useStoredPreference(THEME_STORAGE_KEY, "dark");
  const collapsed = sidebarState === "collapsed";
  const theme: Theme = storedTheme === "light" ? "light" : "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function handleSidebarToggle() {
    setPreference(SIDEBAR_STORAGE_KEY, collapsed ? "expanded" : "collapsed");
  }

  function handleThemeToggle() {
    setPreference(THEME_STORAGE_KEY, theme === "dark" ? "light" : "dark");
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[color:var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--ambient-gradient)]" />
      <div className="pointer-events-none fixed inset-0 bg-[var(--grid-pattern)] bg-[size:72px_72px]" />

      <div className="relative flex min-h-screen">
        <aside
          className={[
            "sticky top-0 z-[70] hidden h-screen shrink-0 flex-col overflow-visible border-r border-[color:var(--border)] bg-[var(--sidebar-bg)] backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex",
            collapsed ? "w-[84px]" : "w-[288px]"
          ].join(" ")}
        >
          <div
            className={[
              "flex h-[72px] items-center border-b border-[color:var(--border)] px-4",
              collapsed ? "justify-center" : "justify-between"
            ].join(" ")}
          >
            {collapsed ? null : (
              <Link
                className="text-base font-semibold tracking-normal text-[color:var(--app-text-strong)]"
                href="/"
              >
                WorkLog
              </Link>
            )}
            <button
              aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
              className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
              onClick={handleSidebarToggle}
              title={collapsed ? "Expandir" : "Recolher"}
              type="button"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" strokeWidth={1.8} />
              ) : (
                <PanelLeftClose className="size-4" strokeWidth={1.8} />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-visible px-3 py-5">
            {navItems.map((item) => (
              <NavLink collapsed={collapsed} item={item} key={item.label} />
            ))}
          </nav>

          <div className="space-y-3 overflow-visible px-3 pb-4">
            <ThemeToggle collapsed={collapsed} onToggle={handleThemeToggle} theme={theme} />
            <EnvPanel collapsed={collapsed} envStatus={envStatus} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[var(--header-bg)] px-5 backdrop-blur-xl lg:hidden">
            <Link className="text-base font-semibold text-[color:var(--app-text-strong)]" href="/">
              WorkLog
            </Link>
            <div className="flex items-center gap-2">
              <button
                aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
                className="grid size-10 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                onClick={handleThemeToggle}
                type="button"
              >
                {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
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
            <div className="flex h-16 items-center justify-between border-b border-[color:var(--border)] px-5">
              <Link
                className="text-base font-semibold text-[color:var(--app-text-strong)]"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                WorkLog
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

            <nav className="space-y-1 px-4 py-5">
              {navItems.map((item) => (
                <NavLink item={item} key={item.label} onSelect={() => setMobileOpen(false)} />
              ))}
            </nav>

            <div className="mt-auto px-4 pb-5">
              <ThemeToggle onToggle={handleThemeToggle} theme={theme} />
              <div className="mt-3" />
              <EnvPanel envStatus={envStatus} />
            </div>
          </aside>

          <section className="relative mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
