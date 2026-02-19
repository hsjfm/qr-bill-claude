"use client";

import { useEffect, useState } from "react";
import { api, ApiLog, LogStats } from "@/lib/api";

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  useEffect(() => {
    Promise.all([api.listLogs(), api.logStats()])
      .then(([l, s]) => {
        setLogs(l);
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    if (filter === "success") return l.status_code === 200;
    if (filter === "error") return l.status_code !== 200;
    return true;
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">API Logs</h1>
      <p className="mb-8 text-zinc-500">Every request made with your API keys, most recent first.</p>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total calls" value={loading ? "…" : Number(stats?.total_calls ?? 0).toLocaleString()} />
        <StatCard label="Today" value={loading ? "…" : Number(stats?.calls_today ?? 0).toLocaleString()} />
        <StatCard label="This month" value={loading ? "…" : Number(stats?.calls_this_month ?? 0).toLocaleString()} />
        <StatCard
          label="Avg duration"
          value={loading ? "…" : stats?.avg_duration_ms ? `${stats.avg_duration_ms} ms` : "—"}
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(["all", "success", "error"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
            }`}
          >
            {f === "all" ? "All" : f === "success" ? "Success" : "Errors"}
            {!loading && (
              <span className="ml-1.5 text-xs opacity-60">
                {f === "all"
                  ? logs.length
                  : f === "success"
                  ? logs.filter((l) => l.status_code === 200).length
                  : logs.filter((l) => l.status_code !== 200).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            No API calls recorded yet. Make a request with your API key to see logs here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <Th>Time</Th>
                  <Th>Endpoint</Th>
                  <Th>Status</Th>
                  <Th>Duration</Th>
                  <Th>API Key</Th>
                  <Th>IP</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="mr-2 rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {log.method}
                      </span>
                      {log.path}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge code={log.status_code} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {log.duration_ms != null ? `${log.duration_ms} ms` : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {log.key_name ? (
                        <span title={log.key_prefix ?? ""}>
                          {log.key_name}
                          <span className="ml-1 font-mono text-xs opacity-50">{log.key_prefix}…</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                      {log.ip ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && logs.length === 200 && (
        <p className="mt-3 text-center text-xs text-zinc-400">Showing most recent 200 calls.</p>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
      {children}
    </th>
  );
}

function StatusBadge({ code }: { code: number }) {
  const ok = code === 200;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        ok
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {code}
    </span>
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
