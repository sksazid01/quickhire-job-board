import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-line)] bg-white/96">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] font-[family-name:var(--font-display)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(92,88,248,0.28)]">
            QH
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
            QuickHire
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-[var(--color-muted)]">
          <Link href="/#featured-jobs" className="transition hover:text-[var(--color-accent)]">
            Find Job
          </Link>
          <Link href="/#companies" className="transition hover:text-[var(--color-accent)]">
            Browse Companies
          </Link>
          <Link href="/admin" className="transition hover:text-[var(--color-accent)]">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            Login
          </Link>
          <Link
            href="/admin"
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(92,88,248,0.28)] transition hover:bg-[var(--color-accent-strong)]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
