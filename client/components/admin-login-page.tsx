"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkAdminCredentials, setAdminSession } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    startTransition(() => {
      if (checkAdminCredentials(username.trim(), password)) {
        setAdminSession();
        router.replace("/admin");
      } else {
        setError("Incorrect username or password.");
      }
    });
  }

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-[36px] border border-black/8 bg-white p-8 shadow-[0_24px_90px_rgba(16,24,40,0.10)]">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Admin access
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">
              Sign in
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Enter your admin credentials to manage job listings.
            </p>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <p className="text-sm font-medium text-red-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--color-accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
