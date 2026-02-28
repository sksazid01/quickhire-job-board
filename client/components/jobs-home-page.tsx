"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { fetchJobMeta, fetchJobs } from "@/lib/api";
import type { Job, JobMeta } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { SiteHeader } from "@/components/site-header";

const emptyMeta: JobMeta = {
  categories: [],
  locations: [],
};

export function JobsHomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<JobMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const controller = new AbortController();

    fetchJobMeta(controller.signal)
      .then((data) => {
        setMeta(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMeta(emptyMeta);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(
      {
        search: deferredSearch,
        category,
        location,
      },
      controller.signal
    )
      .then((data) => {
        setJobs(data);
        setError("");
      })
      .catch((requestError) => {
        if (controller.signal.aborted) {
          return;
        }

        setJobs([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load job listings."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [category, deferredSearch, location]);

  const companyCount = new Set(jobs.map((job) => job.company)).size;
  const locationCount = new Set(jobs.map((job) => job.location)).size;

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="rounded-[36px] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,232,218,0.92))] p-8 shadow-[0_24px_90px_rgba(16,24,40,0.08)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Job board
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-[var(--color-foreground)] md:text-6xl">
              Find the next role that actually moves your career.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
              Browse thoughtfully curated opportunities, filter by category or
              location, and apply in minutes through a focused hiring experience.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/80 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Open roles
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">
                  {jobs.length}
                </p>
              </div>
              <div className="rounded-[24px] bg-white/80 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Hiring teams
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">
                  {companyCount}
                </p>
              </div>
              <div className="rounded-[24px] bg-white/80 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Locations
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-foreground)]">
                  {locationCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-black/8 bg-[var(--color-ink)] p-8 text-white shadow-[0_24px_90px_rgba(16,24,40,0.16)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              For recruiters
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
              Publish roles and manage openings from one admin view.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              QuickHire includes a lightweight admin workflow for posting jobs and
              removing closed listings without leaving the project.
            </p>
            <Link
              href="/admin"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:translate-y-[-1px]"
            >
              Open Admin Panel
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <label className="flex-1 space-y-2 text-sm font-semibold text-[var(--color-foreground)]">
              <span>Search jobs</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setIsLoading(true);
                  setError("");
                  setSearch(event.target.value);
                }}
                placeholder="Search by title, company, or keyword"
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 text-base outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[var(--color-foreground)] lg:min-w-52">
              <span>Category</span>
              <select
                value={category}
                onChange={(event) => {
                  setIsLoading(true);
                  setError("");
                  setCategory(event.target.value);
                }}
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 text-base outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="">All categories</option>
                {meta.categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-semibold text-[var(--color-foreground)] lg:min-w-52">
              <span>Location</span>
              <select
                value={location}
                onChange={(event) => {
                  setIsLoading(true);
                  setError("");
                  setLocation(event.target.value);
                }}
                className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 text-base outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="">All locations</option>
                {meta.locations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError("");
                setSearch("");
                setCategory("");
                setLocation("");
              }}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Opportunities
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                Available positions
              </h2>
            </div>
            <p className="text-base text-[var(--color-muted)]">
              Search is applied as you type. Filters are powered by the backend API.
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-[28px] border border-red-200 bg-white p-6 text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 grid gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]"
                >
                  <div className="h-6 w-28 animate-pulse rounded-full bg-black/8" />
                  <div className="mt-5 h-10 w-1/2 animate-pulse rounded-2xl bg-black/8" />
                  <div className="mt-4 h-6 w-1/3 animate-pulse rounded-2xl bg-black/8" />
                  <div className="mt-6 h-20 animate-pulse rounded-[24px] bg-black/8" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && !jobs.length && !error ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-black/14 bg-white/80 p-10 text-center">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
                No roles matched your filters
              </h3>
              <p className="mt-3 text-base text-[var(--color-muted)]">
                Reset the filters or try a broader keyword to explore more openings.
              </p>
            </div>
          ) : null}

          {!isLoading && jobs.length ? (
            <div className="mt-6 grid gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
