import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-black/8 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Q
          </span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-foreground)]">
              QuickHire
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Modern hiring for fast-moving teams
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-muted)]">
          <Link
            href="/"
            className="rounded-full border border-black/10 px-4 py-2 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Explore Jobs
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-black/10 px-4 py-2 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Admin Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
