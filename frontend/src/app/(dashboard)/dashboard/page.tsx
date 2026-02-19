"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiKey, LogStats } from "@/lib/api";

export default function DashboardPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listKeys(), api.logStats()])
      .then(([k, s]) => {
        setKeys(k);
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">Overview</h1>
      <p className="mb-8 text-zinc-500">Welcome to your Swiss QR Bill API dashboard.</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Active API keys"
          value={loading ? "…" : String(keys.length)}
        />
        <StatCard
          label="Calls today"
          value={loading ? "…" : Number(stats?.calls_today ?? 0).toLocaleString()}
        />
        <StatCard
          label="Calls this month"
          value={loading ? "…" : Number(stats?.calls_this_month ?? 0).toLocaleString()}
        />
        <StatCard
          label="Total calls"
          value={loading ? "…" : Number(stats?.total_calls ?? 0).toLocaleString()}
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">Quick start</h2>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Step n={1} text="Create an API key on the" link={{ href: "/dashboard/keys", label: "API Keys page" }} />
          <Step n={2} text="Call POST /api/generate with your X-Api-Key header" />
          <Step n={3} text="Receive your compliant Swiss QR Bill PDF" />
          <Step n={4} text="Monitor usage on the" link={{ href: "/dashboard/logs", label: "Logs page" }} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function Step({
  n,
  text,
  link,
}: {
  n: number;
  text: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        {n}
      </span>
      <p>
        {text}{" "}
        {link && (
          <Link href={link.href} className="font-medium text-red-600 hover:underline">
            {link.label}
          </Link>
        )}
      </p>
    </div>
  );
}
