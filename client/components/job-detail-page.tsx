"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJob } from "@/lib/api";
import type { Job } from "@/lib/types";
import { ApplicationForm } from "@/components/application-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type JobDetailPageProps = {
  jobId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchJob(jobId, controller.signal)
      .then((data) => {
        setJob(data);
        setError("");
      })
      .catch((requestError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load job details."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [jobId]);

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Back to all jobs
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="h-7 w-40 animate-pulse rounded-full bg-black/8" />
            <div className="mt-6 h-12 w-2/3 animate-pulse rounded-2xl bg-black/8" />
            <div className="mt-4 h-6 w-1/2 animate-pulse rounded-2xl bg-black/8" />
            <div className="mt-8 h-40 animate-pulse rounded-[28px] bg-black/8" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-white p-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
              Job unavailable
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
              {error}
            </p>
          </div>
        ) : null}

        {job ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <section className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[var(--color-accent)]">
                  {job.category}
                </span>
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-1">
                  {job.employment_type}
                </span>
              </div>

              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--color-foreground)] md:text-5xl">
                {job.title}
              </h1>

              <p className="mt-4 text-lg text-[var(--color-muted)]">
                {job.company} • {job.location}
              </p>

              <div className="mt-8 grid gap-4 rounded-[28px] bg-[var(--color-surface)] p-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Compensation
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {job.salary_range}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Posted
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {formatDate(job.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Applications
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {job.application_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Team
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {job.company}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
                  Role overview
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-[var(--color-muted)]">
                  {job.description}
                </p>
              </div>
            </section>

            <aside className="space-y-6">
              <ApplicationForm jobId={job.id} />

              <div className="rounded-[28px] border border-black/8 bg-[var(--color-ink)] p-6 text-white shadow-[0_24px_80px_rgba(16,24,40,0.16)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                  Hiring notes
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">
                  Fast review cycle
                </h2>
                <p className="mt-3 text-base leading-7 text-white/80">
                  Profiles are reviewed on a rolling basis. Strong candidates usually
                  hear back within three to five business days.
                </p>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
