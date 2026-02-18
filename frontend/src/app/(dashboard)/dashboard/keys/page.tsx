"use client";

import { useEffect, useState } from "react";
import { api, ApiKey, NewApiKey } from "@/lib/api";

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState<NewApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function fetchKeys() {
    try {
      setKeys(await api.listKeys());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await api.createKey(newName.trim());
      setNewKey(created);
      setNewName("");
      setShowModal(false);
      await fetchKeys();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? Any integrations using it will stop working.")) return;
    setRevoking(id);
    try {
      await api.revokeKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke key");
    } finally {
      setRevoking(null);
    }
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">API Keys</h1>
          <p className="text-sm text-zinc-500">Manage keys for authenticating API requests.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          + New key
        </button>
      </div>

      {/* One-time key display */}
      {newKey && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
          <p className="mb-1 font-semibold text-green-800 dark:text-green-300">
            Key created: {newKey.name}
          </p>
          <p className="mb-3 text-sm text-green-700 dark:text-green-400">
            Save this key now — it will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 dark:bg-zinc-900 dark:text-white">
              {newKey.key}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-zinc-900 dark:text-green-400"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-green-600 underline"
          >
            I&apos;ve saved it, dismiss
          </button>
        </div>
      )}

      {/* Keys table */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No API keys yet.{" "}
            <button
              onClick={() => setShowModal(true)}
              className="font-medium text-red-600 hover:underline"
            >
              Create your first key
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                {["Name", "Prefix", "Created", "Last used", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {keys.map((key) => (
                <tr key={key.id}>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">
                    {key.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-zinc-500">
                    {key.key_prefix}…
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {key.last_used_at
                      ? new Date(key.last_used_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      {revoking === key.id ? "Revoking…" : "Revoke"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Create new API key
            </h2>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Production, Staging"
              className="mb-4 w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setNewName(""); }}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
