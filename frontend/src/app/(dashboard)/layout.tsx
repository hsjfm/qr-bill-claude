"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearToken } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setEmail(user.email || "");
    } catch {
      // ignore
    }
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/keys", label: "API Keys" },
    { href: "/dashboard/logs", label: "Logs" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
            SwissQR<span className="text-red-600">Bill</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="mb-2 truncate text-xs text-zinc-500">{email}</p>
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
