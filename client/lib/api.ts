import type {
  ApplicationPayload,
  Job,
  JobFilters,
  JobMeta,
  JobPayload,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

function buildUrl(path: string, params?: Record<string, string>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.errors?.join(" ") || data?.message || "Request failed. Please try again.";

    throw new Error(message);
  }

  return data as T;
}

export async function fetchJobs(filters: JobFilters, signal?: AbortSignal) {
  const url = buildUrl("/api/jobs", filters);
  const response = await fetch(url, { signal, cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load job listings.");
  }

  return (await response.json()) as Job[];
}

export async function fetchJob(jobId: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    signal,
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("This job could not be found.");
  }

  if (!response.ok) {
    throw new Error("Unable to load job details.");
  }

  return (await response.json()) as Job;
}

export function fetchJobMeta(signal?: AbortSignal) {
  return request<JobMeta>("/api/jobs/meta", {
    method: "GET",
    signal,
  });
}

export function createJob(payload: JobPayload) {
  return request<Job>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteJob(jobId: number) {
  await request<void>(`/api/jobs/${jobId}`, {
    method: "DELETE",
  });
}

export function submitApplication(payload: ApplicationPayload) {
  return request("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
