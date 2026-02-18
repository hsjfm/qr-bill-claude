import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white"
      >
        SwissQR<span className="text-red-600">Bill</span>
      </Link>
      {children}
    </div>
  );
}
