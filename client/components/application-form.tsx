"use client";

import { useState, useTransition } from "react";
import { submitApplication } from "@/lib/api";

type ApplicationFormProps = {
  jobId: number;
};

const initialFormState = {
  name: "",
  email: "",
  resume_link: "",
  cover_note: "",
};

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function sendApplication() {
    try {
      await submitApplication({
        job_id: jobId,
        ...formState,
      });

      setFormState(initialFormState);
      setSuccessMessage("Application submitted successfully.");
      setError("");
    } catch (submissionError) {
      setSuccessMessage("");
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit application."
      );
    }
  }

  return (
    <form
      className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.08)]"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        startTransition(() => {
          void sendApplication();
        });
      }}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Apply Now
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
          Send your application
        </h2>
        <p className="text-base leading-7 text-[var(--color-muted)]">
          Share the essentials and we will route your profile directly to the hiring
          team.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
          <span>Name</span>
          <input
            type="text"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
            placeholder="Alex Carter"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
          <span>Email</span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
            placeholder="alex@company.com"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
          <span>Resume Link</span>
          <input
            type="url"
            value={formState.resume_link}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                resume_link: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
            placeholder="https://portfolio.example/resume"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
          <span>Cover Note</span>
          <textarea
            value={formState.cover_note}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                cover_note: event.target.value,
              }))
            }
            className="min-h-36 w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 outline-none transition focus:border-[var(--color-accent)]"
            placeholder="Tell us why this role is a strong fit."
            required
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--color-accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
