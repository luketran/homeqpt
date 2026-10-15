import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/sign-out-button";

export interface NavLink {
  href: string;
  label: string;
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  links: NavLink[];
  userName?: string | null;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  links,
  userName,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
        <div className="mb-6 px-2">
          <p className="text-base font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-200 pt-3">
          {userName && (
            <p className="px-3 pb-1 text-xs text-slate-400">{userName}</p>
          )}
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
