"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Clock3,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  X,
  type LucideIcon
} from "lucide-react";

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
          ? "bg-white/[0.12] text-white shadow-sm shadow-black/20"
          : "text-white/55 hover:bg-white/[0.07] hover:text-white"
      ].join(" ")}
      href={item.href}
      onClick={onSelect}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>

      {collapsed ? (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#161616] px-2.5 py-1.5 text-xs text-white/78 shadow-2xl shadow-black/40 group-hover:block">
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
      <div className="group relative mx-auto grid size-11 place-items-center rounded-md border border-white/10 bg-white/[0.045]">
        <span
          className={[
            "size-2 rounded-full",
            envStatus.configured ? "bg-emerald-300" : "bg-amber-300"
          ].join(" ")}
        />
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#161616] px-2.5 py-1.5 text-xs text-white/78 shadow-2xl shadow-black/40 group-hover:block">
          {envStatus.configured ? "Variaveis configuradas" : "Variaveis pendentes"}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/38">Ambiente</p>
      <p className="mt-2 text-sm font-medium">
        {envStatus.configured ? "Variaveis configuradas" : "Variaveis pendentes"}
      </p>
      <div className="mt-4 space-y-2">
        {Object.entries(envStatus.keys).map(([key, configured]) => (
          <div className="flex items-center justify-between gap-4 text-xs" key={key}>
            <span className="truncate text-white/52">{key}</span>
            <span className={configured ? "text-emerald-300" : "text-amber-300"}>
              {configured ? "ok" : "pendente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppShell({
  children,
  envStatus
}: {
  children: ReactNode;
  envStatus: EnvStatus;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.11),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative flex min-h-screen">
        <aside
          className={[
            "sticky top-0 hidden h-screen shrink-0 flex-col overflow-visible border-r border-white/10 bg-[#0d0d0d]/92 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex",
            collapsed ? "w-[84px]" : "w-[288px]"
          ].join(" ")}
        >
          <div
            className={[
              "flex h-[72px] items-center border-b border-white/10 px-4",
              collapsed ? "justify-center" : "justify-between"
            ].join(" ")}
          >
            {collapsed ? null : (
              <Link className="text-base font-semibold tracking-normal text-white" href="/">
                WorkLog
              </Link>
            )}
            <button
              aria-label={collapsed ? "Expandir navegacao" : "Recolher navegacao"}
              className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white"
              onClick={() => setCollapsed((value) => !value)}
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

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => (
              <NavLink collapsed={collapsed} item={item} key={item.label} />
            ))}
          </nav>

          <div className="px-3 pb-4">
            <EnvPanel collapsed={collapsed} envStatus={envStatus} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b0b0b]/88 px-5 backdrop-blur-xl lg:hidden">
            <Link className="text-base font-semibold text-white" href="/">
              WorkLog
            </Link>
            <button
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.045] text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
              onClick={() => setMobileOpen((value) => !value)}
              type="button"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
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
              "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[332px] flex-col border-r border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/50 transition-transform duration-300 ease-out lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            ].join(" ")}
          >
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link
                className="text-base font-semibold text-white"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                WorkLog
              </Link>
              <button
                aria-label="Fechar menu"
                className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/[0.045] text-white/72"
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
