import Link from "next/link";
import type { Job } from "@/lib/types";

type JobCardProps = {
  job: Job;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[var(--color-accent)]">
              {job.category}
            </span>
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1">
              {job.employment_type}
            </span>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
              {job.title}
            </h3>
            <p className="mt-1 text-base font-medium text-[var(--color-muted)]">
              {job.company} • {job.location}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-ink)] px-4 py-3 text-right text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Salary</p>
          <p className="mt-1 text-lg font-semibold">{job.salary_range}</p>
        </div>
      </div>

      <p className="mt-5 line-clamp-3 text-base leading-7 text-[var(--color-muted)]">
        {job.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-5">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
          <span>{job.application_count} applications</span>
          <span>{formatDate(job.created_at)}</span>
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[color:var(--color-accent-deep)]"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
