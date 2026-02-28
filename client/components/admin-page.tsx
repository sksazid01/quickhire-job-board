"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createJob, deleteJob, fetchJobs } from "@/lib/api";
import { clearAdminSession, isAdminAuthenticated } from "@/lib/auth";
import type { Job, JobPayload } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";

const initialFormState: JobPayload = {
  title: "",
  company: "",
  location: "",
  category: "",
  description: "",
  employment_type: "",
  salary_range: "",
};

export function AdminPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formState, setFormState] = useState<JobPayload>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(
      {
        search: "",
        category: "",
        location: "",
      },
      controller.signal
    )
      .then((data) => {
        setJobs(data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load jobs."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  async function submitNewJob() {
    try {
      const createdJob = await createJob(formState);
      setJobs((current) => [createdJob, ...current]);
      setFormState(initialFormState);
      setFeedback("Job listing added.");
      setError("");
    } catch (submissionError) {
      setFeedback("");
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create job."
      );
    }
  }

  async function removeJob(jobId: number) {
    try {
      await deleteJob(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
      setFeedback("Job listing deleted.");
      setError("");
    } catch (deletionError) {
      setFeedback("");
      setError(
        deletionError instanceof Error
          ? deletionError.message
          : "Unable to delete job."
      );
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />

      {!isAuthChecked ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[var(--color-accent)]" />
        </div>
      ) : (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(223,236,255,0.92))] p-8 shadow-[0_24px_90px_rgba(16,24,40,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Admin panel
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-red-400 hover:text-red-600"
          >
            Sign out
          </button>
          </div>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--color-foreground)] md:text-5xl">
                Manage openings without leaving the board.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
                Add new roles, remove closed listings, and quickly jump into the
                public job detail pages to verify what candidates see.
              </p>
            </div>

            <div className="rounded-[28px] bg-white/80 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Active listings
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold text-[var(--color-foreground)]">
                {jobs.length}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]"
            onSubmit={(event) => {
              event.preventDefault();
              setFeedback("");
              setError("");

              startTransition(() => {
                void submitNewJob();
              });
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Add listing
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                Create a new job
              </h2>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                <span>Title</span>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Company</span>
                  <input
                    type="text"
                    value={formState.company}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Location</span>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Category</span>
                  <input
                    type="text"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Employment Type</span>
                  <input
                    type="text"
                    value={formState.employment_type}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        employment_type: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                    placeholder="Full-time"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                <span>Salary Range</span>
                <input
                  type="text"
                  value={formState.salary_range}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      salary_range: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                  placeholder="$90k - $110k"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                <span>Description</span>
                <textarea
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-40 w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
                  required
                />
              </label>
            </div>

            {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
            {feedback ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">{feedback}</p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--color-accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Publish Job"}
            </button>
          </form>

          <section className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Listings
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                  Current jobs
                </h2>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-black/8 bg-[var(--color-surface)] p-5"
                  >
                    <div className="h-8 w-1/2 animate-pulse rounded-2xl bg-black/8" />
                    <div className="mt-3 h-5 w-1/3 animate-pulse rounded-2xl bg-black/8" />
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && !jobs.length ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-black/14 bg-[var(--color-surface)] p-8 text-center">
                <p className="text-base text-[var(--color-muted)]">
                  No jobs yet. Add the first opening from the form.
                </p>
              </div>
            ) : null}

            {!isLoading && jobs.length ? (
              <div className="mt-6 space-y-4">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-[24px] border border-black/8 bg-[var(--color-surface)] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
                          {job.title}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          {job.company} • {job.location} • {job.category}
                        </p>
                        <p className="mt-3 text-sm text-[var(--color-muted)]">
                          {job.salary_range} • {job.application_count} applications
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback("");
                            setError("");

                            startTransition(() => {
                              void removeJob(job.id);
                            });
                          }}
                          disabled={isPending}
                          className="rounded-full bg-[var(--color-foreground)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </main>
      )}
    </div>
  );
}
