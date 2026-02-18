import Link from "next/link";

const codeExample = `curl -X POST https://api.qr-bill.com/api/generate \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -F 'data={
    "creditor": {
      "account": "CH44 3199 9123 0008 8901 2",
      "name": "Headswap SA",
      "street": "Avenue de Tivoli",
      "buildingNumber": "24",
      "postalCode": "1007",
      "city": "Lausanne",
      "country": "CH"
    },
    "debtor": {
      "name": "Max Muster",
      "street": "Bahnhofstrasse",
      "buildingNumber": "1",
      "postalCode": "8001",
      "city": "Zürich",
      "country": "CH"
    },
    "payment": {
      "amount": 1250.00,
      "currency": "CHF",
      "referenceType": "NON",
      "unstructuredMessage": "Invoice 2025-001"
    }
  }' \\
  -F 'pdf=@invoice.pdf' \\
  --output invoice-with-qr.pdf`;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              SwissQR<span className="text-red-600">Bill</span>
            </span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              API
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get API Key
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          SIX Swiss Payment Standards v2.3 compliant
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
          Swiss QR Bills,
          <br />
          <span className="text-red-600">via API</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
          Generate standards-compliant QR payment slips in seconds. Pass your invoice PDF
          and payment details — get back a perfectly formatted QR bill, ready to send.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-red-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-red-700 sm:w-auto"
          >
            Start for free
          </Link>
          <a
            href="#docs"
            className="w-full rounded-xl border border-zinc-200 px-8 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:w-auto"
          >
            View docs
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🏦",
                title: "Standards compliant",
                desc: "Fully compliant with SIX Swiss Payment Standards v2.3. Supports CHF/EUR, QRR, SCOR, and NON reference types.",
              },
              {
                icon: "📄",
                title: "Append to invoices",
                desc: "Upload your existing invoice PDF and receive it back with the QR payment slip appended as the final page.",
              },
              {
                icon: "⚡",
                title: "Simple REST API",
                desc: "One endpoint, one API key. Send multipart form data, get back a PDF. Integrate in minutes.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="mb-3 text-3xl">{icon}</div>
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">{title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Docs */}
      <section id="docs" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
          API Reference
        </h2>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Base URL:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">
            https://api.qr-bill.com
          </code>
        </p>

        {/* Endpoint card */}
        <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
            <span className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              POST
            </span>
            <code className="font-mono text-sm text-zinc-900 dark:text-white">
              /api/generate
            </code>
            <span className="ml-auto text-xs text-zinc-500">API Key required</span>
          </div>
          <div className="p-6">
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Generate a QR payment slip. Optionally attach an invoice PDF to receive the two combined.
            </p>

            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Request — multipart/form-data
            </h4>
            <div className="mb-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[
                    ["data", "JSON string (required)", "Payment data object (see example)"],
                    ["pdf", "File (optional)", "Existing invoice PDF to append the QR slip to"],
                  ].map(([field, type, desc]) => (
                    <tr key={field}>
                      <td className="px-4 py-2 font-mono text-zinc-900 dark:text-white">{field}</td>
                      <td className="px-4 py-2 text-zinc-500">{type}</td>
                      <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Example
            </h4>
            <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-5 text-xs leading-relaxed text-zinc-100">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>

        {/* Auth endpoints summary */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Authentication</h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[
              ["POST", "/api/auth/signup", "Create account, returns JWT"],
              ["POST", "/api/auth/login", "Login, returns JWT"],
              ["GET", "/api/keys", "List your API keys (JWT required)"],
              ["POST", "/api/keys", "Generate new API key (JWT required)"],
              ["DELETE", "/api/keys/:id", "Revoke an API key (JWT required)"],
            ].map(([method, path, desc]) => (
              <div key={path} className="flex items-center gap-4 px-6 py-3">
                <span
                  className={`w-14 rounded text-center text-xs font-bold py-0.5 ${
                    method === "POST"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : method === "DELETE"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {method}
                </span>
                <code className="font-mono text-sm text-zinc-900 dark:text-white">{path}</code>
                <span className="ml-auto text-sm text-zinc-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
          Ready to integrate?
        </h2>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Sign up, get an API key, and generate your first QR bill in minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-xl bg-red-600 px-10 py-4 font-semibold text-white hover:bg-red-700"
        >
          Get started for free
        </Link>
      </section>

      <footer className="border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} SwissQRBill API — SIX Swiss Payment Standards compliant
      </footer>
    </div>
  );
}
