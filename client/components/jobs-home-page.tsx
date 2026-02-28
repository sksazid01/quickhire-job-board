"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { fetchJobMeta, fetchJobs } from "@/lib/api";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Job, JobMeta } from "@/lib/types";

const emptyMeta: JobMeta = {
  categories: [],
  locations: [],
};

const defaultCategories = [
  { name: "Design", summary: "UI and product design roles" },
  { name: "Sales", summary: "Pipeline and revenue teams" },
  { name: "Marketing", summary: "Brand and campaign specialists" },
  { name: "Finance", summary: "Planning and reporting roles" },
  { name: "Technology", summary: "Platform and infrastructure roles" },
  { name: "Engineering", summary: "Frontend, backend, and full-stack" },
  { name: "Business", summary: "Strategy and operations teams" },
  { name: "Human Resource", summary: "Talent and people experience" },
];

const companyMarks = ["vodafone", "intel", "TESLA", "AMD", "Talkit"];
const popularSearches = ["Designer", "Writer", "Senior Engineer", "Remote"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function splitInHalf<T>(items: T[]) {
  const midpoint = Math.ceil(items.length / 2);

  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function getCategoryCards(meta: JobMeta, jobs: Job[]) {
  const categoryCounts = new Map<string, number>();

  for (const job of jobs) {
    categoryCounts.set(job.category, (categoryCounts.get(job.category) || 0) + 1);
  }

  const orderedNames = [
    ...defaultCategories.map((item) => item.name),
    ...meta.categories,
  ].filter((value, index, values) => values.indexOf(value) === index);

  return orderedNames.slice(0, 8).map((name) => {
    const fallback =
      defaultCategories.find((item) => item.name === name) || defaultCategories[0];

    return {
      name,
      summary: fallback.summary,
      count: categoryCounts.get(name) || 0,
    };
  });
}

function FeaturedJobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-[22px] border border-[var(--color-line)] bg-white p-5 shadow-[0_18px_40px_rgba(41,47,88,0.06)] transition hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-accent)]">
          {job.company.slice(0, 2).toUpperCase()}
        </span>
        <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {job.employment_type}
        </span>
      </div>

      <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
        {job.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {job.company} . {job.location}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
          {job.category}
        </span>
        <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-medium text-[var(--color-blue)]">
          {job.salary_range}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {formatDate(job.created_at)}
        </span>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-semibold text-[var(--color-accent)]"
        >
          View Job
        </Link>
      </div>
    </article>
  );
}

function LatestJobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-[20px] border border-white bg-white px-4 py-4 shadow-[0_16px_30px_rgba(41,47,88,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-accent)]">
          {job.company.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-foreground)]">
                {job.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {job.company} . {job.location}
              </p>
            </div>
            <span className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {job.category}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[var(--color-blue)]">
              {job.salary_range}
            </span>
            <Link
              href={`/jobs/${job.id}`}
              className="text-sm font-semibold text-[var(--color-accent)]"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobsHomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<JobMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "applications" | "">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
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
        employment_type: employmentType,
        sort,
      },
      controller.signal
    )
      .then(({ jobs: fetched }) => {
        setJobs(fetched);
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
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [category, deferredSearch, employmentType, location, sort]);

  const categoryCards = getCategoryCards(meta, jobs);
  const featuredJobs = jobs.slice(0, 8);
  const latestJobs = splitInHalf(jobs.slice(0, 6));

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-14">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
              Hire smarter
            </p>
            <h1 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.96] text-[var(--color-foreground)] md:text-[64px]">
              Discover more than{" "}
              <span className="text-[var(--color-blue)]">5000+ Jobs</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[var(--color-muted)]">
              Find the role that is built for you. Browse curated openings, apply
              faster, and move from search to shortlist with one streamlined board.
            </p>

            <form
              className="mt-8 rounded-[20px] border border-[var(--color-line)] bg-white p-3 shadow-[0_24px_50px_rgba(41,47,88,0.08)]"
              onSubmit={(event) => {
                event.preventDefault();
                document
                  .getElementById("featured-jobs")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <div className="grid gap-3 md:grid-cols-[1.4fr_0.9fr_180px]">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setIsLoading(true);
                    setIsSearching(true);
                    setError("");
                    setSearch(event.target.value);
                  }}
                  placeholder="Job title or keyword"
                  className={`rounded-2xl border px-4 py-3.5 text-sm outline-none transition focus:border-[var(--color-accent)] ${
                    isSearching
                      ? "animate-pulse border-[var(--color-accent)]"
                      : "border-[var(--color-line)]"
                  }`}
                />
                <select
                  value={location}
                  onChange={(event) => {
                    setIsLoading(true);
                    setError("");
                    setLocation(event.target.value);
                  }}
                  className="rounded-2xl border border-[var(--color-line)] px-4 py-3.5 text-sm outline-none transition focus:border-[var(--color-accent)]"
                >
                  <option value="">Preferred location</option>
                  {meta.locations.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-2xl bg-[var(--color-accent)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(92,88,248,0.28)] transition hover:bg-[var(--color-accent-strong)]"
                >
                  Search my job
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
              <span>Popular Searches:</span>
              {popularSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setError("");
                    setSearch(item);
                  }}
                  className="transition hover:text-[var(--color-accent)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f7f7fe_0%,#eef0ff_100%)] px-6 py-8">
            <div className="absolute left-8 top-8 h-32 w-32 rounded-[28px] border border-[var(--color-line)]" />
            <div className="absolute right-10 top-6 h-44 w-44 rounded-[36px] border border-[var(--color-line)]" />
            <div className="absolute bottom-8 left-6 h-24 w-24 rounded-full border border-[var(--color-line)]" />

            <div className="relative mx-auto flex min-h-[430px] max-w-md items-center justify-center">
              <div className="absolute inset-x-10 bottom-2 h-[310px] rounded-[44px] bg-[linear-gradient(180deg,rgba(92,88,248,0.18),rgba(42,167,255,0.1))]" />
              <div className="absolute inset-x-8 top-6 bottom-8 overflow-hidden rounded-[44px] border border-white/60 bg-white/55 shadow-[0_30px_70px_rgba(41,47,88,0.12)]">
                <Image
                  src="/quickhire-reference.svg"
                  alt="QuickHire interface reference artwork"
                  fill
                  priority
                  className="object-cover object-[76%_0%]"
                  sizes="(min-width: 1024px) 420px, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,247,254,0.55)_0%,rgba(247,247,254,0.05)_38%,rgba(247,247,254,0)_100%)]" />
                <div className="absolute bottom-5 left-5 rounded-[20px] bg-white/92 px-4 py-3 shadow-[0_16px_30px_rgba(41,47,88,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Visual match
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
                    Reference-aligned hero
                  </p>
                </div>
              </div>
              <div className="absolute right-0 top-12 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_35px_rgba(41,47,88,0.1)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Shortlist
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
                  24 profiles
                </p>
              </div>
              <div className="absolute bottom-12 left-0 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_35px_rgba(41,47,88,0.1)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  New Match
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
                  Senior Designer
                </p>
              </div>
              <div className="pointer-events-none relative h-[340px] w-[260px]" />
            </div>
          </div>
        </section>

        <section
          id="companies"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-10 text-[22px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] sm:px-6 lg:px-8"
        >
          {companyMarks.map((mark) => (
            <span key={mark} className="opacity-80">
              {mark}
            </span>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Explore by category
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[34px] font-semibold text-[var(--color-foreground)]">
                Explore by category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError("");
                setSearch("");
                setCategory("");
                setLocation("");
                setEmploymentType("");
              }}
              className="text-sm font-semibold text-[var(--color-accent)]"
            >
              Show all jobs
            </button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((item, index) => {
              const isHighlighted = index === 2;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setError("");
                    setCategory(item.name);
                    setEmploymentType("");
                  }}
                  className={`rounded-[24px] border p-6 text-left transition hover:-translate-y-1 ${
                    isHighlighted
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_20px_40px_rgba(92,88,248,0.24)]"
                      : "border-[var(--color-line)] bg-white text-[var(--color-foreground)] shadow-[0_16px_30px_rgba(41,47,88,0.05)]"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-sm font-semibold ${
                      isHighlighted
                        ? "bg-white/14 text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-accent)]"
                    }`}
                  >
                    {item.name.slice(0, 2).toUpperCase()}
                  </span>
                  <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold">
                    {item.name}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      isHighlighted ? "text-white/75" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {item.summary}
                  </p>
                  <p
                    className={`mt-5 text-xs font-semibold uppercase tracking-[0.18em] ${
                      isHighlighted ? "text-white/70" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {item.count} job available
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[30px] bg-[var(--color-accent)] text-white lg:grid-cols-[0.8fr_1.2fr]">
            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Recruiter CTA
              </p>
              <h2 className="mt-4 max-w-xs font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
                Start posting jobs today
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">
                Publish a role, manage openings, and keep your hiring funnel moving
                from the QuickHire admin panel.
              </p>
              <Link
                href="/admin"
                className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[var(--color-accent)]"
              >
                Sign Up For Free
              </Link>
            </div>

            <div className="relative min-h-[320px] bg-[linear-gradient(135deg,#eff1ff_0%,#ffffff_100%)] p-6">
              <div className="absolute left-6 right-6 top-8 rounded-[28px] bg-white p-4 shadow-[0_24px_50px_rgba(41,47,88,0.08)]">
                <div className="grid gap-3 md:grid-cols-[1.3fr_repeat(2,0.8fr)]">
                  <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3" />
                  <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3" />
                  <div className="rounded-2xl bg-[var(--color-accent)] px-4 py-3" />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] bg-[var(--color-surface)] p-4">
                    <div className="grid grid-cols-12 items-end gap-2">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <div
                          key={index}
                          className="rounded-full bg-[var(--color-accent-soft)]"
                          style={{ height: `${20 + ((index % 5) + 1) * 12}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="rounded-[24px] bg-white p-4 shadow-[0_10px_20px_rgba(41,47,88,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        Visitors
                      </p>
                      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                        67
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white p-4 shadow-[0_10px_20px_rgba(41,47,88,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        New applicants
                      </p>
                      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                        24
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured-jobs" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Featured jobs
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[34px] font-semibold text-[var(--color-foreground)]">
                Featured jobs
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={employmentType}
                onChange={(e) => { setIsLoading(true); setEmploymentType(e.target.value); }}
                className="rounded-2xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="">All types</option>
                {(meta.employment_types.length
                  ? meta.employment_types
                  : ["Full-time", "Part-time", "Contract", "Internship", "Remote"]
                ).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => { setIsLoading(true); setSort(e.target.value as typeof sort); }}
                className="rounded-2xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="applications">Most applications</option>
              </select>
              <Link href="/admin" className="text-sm font-semibold text-[var(--color-accent)]">
                Post a new job
              </Link>
            </div>
          </div>

          {/* Active filter chips */}
          {(category || location || employmentType || search) ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Active:</span>
              {search ? (
                <button type="button" onClick={() => { setIsLoading(true); setSearch(""); }} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-red-100 hover:text-red-600">
                  &ldquo;{search}&rdquo; <span aria-hidden>×</span>
                </button>
              ) : null}
              {category ? (
                <button type="button" onClick={() => { setIsLoading(true); setCategory(""); }} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-red-100 hover:text-red-600">
                  {category} <span aria-hidden>×</span>
                </button>
              ) : null}
              {location ? (
                <button type="button" onClick={() => { setIsLoading(true); setLocation(""); }} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-red-100 hover:text-red-600">
                  {location} <span aria-hidden>×</span>
                </button>
              ) : null}
              {employmentType ? (
                <button type="button" onClick={() => { setIsLoading(true); setEmploymentType(""); }} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-red-100 hover:text-red-600">
                  {employmentType} <span aria-hidden>×</span>
                </button>
              ) : null}
              <button type="button" onClick={() => { setIsLoading(true); setSearch(""); setCategory(""); setLocation(""); setEmploymentType(""); }} className="text-xs font-semibold text-[var(--color-muted)] hover:text-red-600">
                Clear all
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[22px] border border-[var(--color-line)] bg-white p-5 shadow-[0_18px_40px_rgba(41,47,88,0.06)]"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-surface)]" />
                  <div className="mt-5 h-5 w-3/4 animate-pulse rounded-full bg-[var(--color-surface)]" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-[var(--color-surface)]" />
                  <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-[var(--color-surface)]" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && !featuredJobs.length ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-10 text-center">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
                No jobs match the current filters
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Try a broader search or clear the active category and location.
              </p>
            </div>
          ) : null}

          {!isLoading && featuredJobs.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredJobs.map((job) => (
                <FeaturedJobCard key={job.id} job={job} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#f7f8ff_0%,#eef3ff_100%)]">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-[var(--color-line)] px-6 py-8 lg:border-b-0 lg:border-r lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                      Latest jobs open
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-semibold text-[var(--color-foreground)]">
                      Latest jobs open
                    </h2>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    {jobs.length} live
                  </span>
                </div>

                {!isLoading && !jobs.length ? (
                  <div className="mt-8 rounded-[20px] border border-dashed border-[var(--color-line)] bg-white/70 px-5 py-8 text-sm text-[var(--color-muted)]">
                    No roles are available with the current filters.
                  </div>
                ) : null}

                <div className="mt-8 space-y-4">
                  {latestJobs[0].map((job) => (
                    <LatestJobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>

              <div className="px-6 py-8 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                      Filter results
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-semibold text-[var(--color-foreground)]">
                      Tailored roles
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setError("");
                      setSearch("");
                      setCategory("");
                      setLocation("");
                    }}
                    className="text-sm font-semibold text-[var(--color-accent)]"
                  >
                    Reset filters
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <select
                    value={category}
                    onChange={(event) => {
                      setIsLoading(true);
                      setError("");
                      setCategory(event.target.value);
                    }}
                    className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  >
                    <option value="">All categories</option>
                    {meta.categories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setIsLoading(true);
                      setError("");
                      setSearch(event.target.value);
                    }}
                    placeholder="Filter by keyword"
                    className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  />
                </div>

                <div className="mt-8 space-y-4">
                  {latestJobs[1].map((job) => (
                    <LatestJobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
