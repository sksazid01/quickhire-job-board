"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createJob, deleteJob, fetchJobMeta, fetchJobs } from "@/lib/api";
import { clearAdminSession, isAdminAuthenticated } from "@/lib/auth";
import * as Toast from "@/lib/toast";
import type { Job, JobMeta, JobPayload } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";

const EMPLOYMENT_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

const initialFormState: JobPayload = {
  title: "",
  company: "",
  location: "",
  category: "",
  description: "",
  employment_type: "",
  salary_range: "",
};

const emptyMeta: JobMeta = { categories: [], locations: [], employment_types: [] };

function ConfirmModal({
  job,
  onConfirm,
  onCancel,
}: {
  job: Job;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">
          Confirm delete
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
          Delete &ldquo;{job.title}&rdquo;?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          This will permanently remove the job listing and all{" "}
          <strong>{job.application_count}</strong> associated application
          {job.application_count !== 1 ? "s" : ""}. This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Delete listing
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<JobMeta>(emptyMeta);
  const [formState, setFormState] = useState<JobPayload>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("");

  // Auth guard
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

  // Load jobs + meta
  useEffect(() => {
    if (!isAuthChecked) return;
    const controller = new AbortController();

    Promise.all([
      fetchJobs({ search: "", category: "", location: "", employment_type: "", sort: "" }, controller.signal),
      fetchJobMeta(controller.signal),
    ])
      .then(([result, metaData]) => {
        setJobs(result.jobs);
        setMeta(metaData);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          Toast.error(err instanceof Error ? err.message : "Unable to load jobs.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAuthChecked]);

  async function submitNewJob() {
    setFieldErrors({});
    try {
      const createdJob = await createJob(formState);
      setJobs((current) => [createdJob, ...current]);
      setFormState(initialFormState);
      Toast.success("Job listing published.");
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        // Try to extract field errors from the server response via error message
        Toast.error(submissionError.message);
      } else {
        Toast.error("Unable to create job.");
      }
    }
  }

  async function removeJob(job: Job) {
    try {
      await deleteJob(job.id);
      setJobs((current) => current.filter((j) => j.id !== job.id));
      Toast.success(`"${job.title}" has been removed.`);
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : "Unable to delete job.");
    } finally {
      setConfirmJob(null);
    }
  }

  // Client-side search/filter within admin listing
  const filteredJobs = useMemo(() => {
    const q = adminSearch.toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q);
      const matchesFilter = !adminFilter || job.category === adminFilter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, adminSearch, adminFilter]);

  const allCategories = useMemo(
    () => [...new Set([...meta.categories, ...jobs.map((j) => j.category)])].sort(),
    [meta.categories, jobs]
  );

  const allEmploymentTypes = useMemo(
    () => [...new Set([...EMPLOYMENT_TYPE_OPTIONS, ...meta.employment_types])],
    [meta.employment_types]
  );

  function field(key: keyof JobPayload) {
    return {
      value: formState[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState((c) => ({ ...c, [key]: e.target.value }));
        setFieldErrors((c) => ({ ...c, [key]: "" }));
      },
    };
  }

  if (!isAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const inputCls = (key: string) =>
    `w-full rounded-2xl border px-4 py-3 outline-none transition ${
      fieldErrors[key]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-black/10 bg-[var(--color-surface)] focus:border-[var(--color-accent)]"
    }`;

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />

      {confirmJob ? (
        <ConfirmModal
          job={confirmJob}
          onConfirm={() => {
            startTransition(() => { void removeJob(confirmJob); });
          }}
          onCancel={() => setConfirmJob(null)}
        />
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero banner */}
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
            <div className="flex shrink-0 gap-4">
              <div className="rounded-[28px] bg-white/80 px-6 py-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Active</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">{jobs.length}</p>
              </div>
              <div className="rounded-[28px] bg-white/80 px-6 py-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Applications</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">
                  {jobs.reduce((sum, j) => sum + j.application_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* ── Add job form ── */}
          <form
            className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(() => { void submitNewJob(); });
            }}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Add listing
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                Create a new job
              </h2>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                <span>Title</span>
                <input type="text" {...field("title")} className={inputCls("title")} placeholder="e.g. Senior Frontend Engineer" required />
                {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Company</span>
                  <input type="text" {...field("company")} className={inputCls("company")} placeholder="e.g. Acme Corp" required />
                  {fieldErrors.company && <p className="text-xs text-red-600">{fieldErrors.company}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Location</span>
                  <input type="text" {...field("location")} className={inputCls("location")} placeholder="e.g. Remote, New York" required />
                  {fieldErrors.location && <p className="text-xs text-red-600">{fieldErrors.location}</p>}
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Category</span>
                  <select {...field("category")} className={inputCls("category")} required>
                    <option value="">Select category</option>
                    {allCategories.length
                      ? allCategories.map((c) => <option key={c} value={c}>{c}</option>)
                      : ["Engineering", "Design", "Marketing", "Operations", "Finance", "Sales"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                    <option value="__custom__" disabled>── or type below ──</option>
                  </select>
                  {formState.category === "" && (
                    <input
                      type="text"
                      placeholder="Or type a custom category"
                      onChange={(e) => setFormState((c) => ({ ...c, category: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)]"
                    />
                  )}
                  {fieldErrors.category && <p className="text-xs text-red-600">{fieldErrors.category}</p>}
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                  <span>Employment Type</span>
                  <select {...field("employment_type")} className={inputCls("employment_type")} required>
                    <option value="">Select type</option>
                    {allEmploymentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {fieldErrors.employment_type && <p className="text-xs text-red-600">{fieldErrors.employment_type}</p>}
                </label>
              </div>

              <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                <span>Salary Range</span>
                <input type="text" {...field("salary_range")} className={inputCls("salary_range")} placeholder="e.g. $90k – $120k" required />
                {fieldErrors.salary_range && <p className="text-xs text-red-600">{fieldErrors.salary_range}</p>}
              </label>

              <label className="space-y-1.5 text-sm font-medium text-[var(--color-foreground)]">
                <span>Description</span>
                <textarea
                  value={formState.description}
                  onChange={(e) => {
                    setFormState((c) => ({ ...c, description: e.target.value }));
                    setFieldErrors((c) => ({ ...c, description: "" }));
                  }}
                  className={`min-h-40 ${inputCls("description")}`}
                  placeholder="Describe the role, responsibilities, and requirements…"
                  required
                />
                {fieldErrors.description && <p className="text-xs text-red-600">{fieldErrors.description}</p>}
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--color-accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                "Publish Job"
              )}
            </button>
          </form>

          {/* ── Current listings ── */}
          <section className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Listings</p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">Current jobs</h2>
              </div>
              <span className="rounded-full bg-[var(--color-surface)] px-4 py-1.5 text-sm font-semibold text-[var(--color-muted)]">
                {filteredJobs.length} / {jobs.length}
              </span>
            </div>

            {/* Admin-side search + filter */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="search"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search by title or company…"
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="">All categories</option>
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {isLoading ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-[24px] border border-black/8 bg-[var(--color-surface)] p-5">
                    <div className="h-7 w-1/2 animate-pulse rounded-2xl bg-black/8" />
                    <div className="mt-3 h-4 w-1/3 animate-pulse rounded-2xl bg-black/8" />
                    <div className="mt-3 h-4 w-1/4 animate-pulse rounded-2xl bg-black/8" />
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && !filteredJobs.length ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-black/14 bg-[var(--color-surface)] p-8 text-center">
                <p className="text-sm text-[var(--color-muted)]">
                  {jobs.length ? "No jobs match the current filter." : "No jobs yet. Add the first opening above."}
                </p>
              </div>
            ) : null}

            {!isLoading && filteredJobs.length ? (
              <div className="mt-6 space-y-4">
                {filteredJobs.map((job) => (
                  <article
                    key={job.id}
                    className="group rounded-[24px] border border-black/8 bg-[var(--color-surface)] p-5 transition hover:border-black/14 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                            {job.category}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            {job.employment_type}
                          </span>
                        </div>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-foreground)]">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {job.company} · {job.location}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
                          {job.salary_range}
                          <span className="ml-3 inline-flex items-center gap-1 text-[var(--color-accent)]">
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                            {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
                          </span>
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmJob(job)}
                          disabled={isPending}
                          className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}
