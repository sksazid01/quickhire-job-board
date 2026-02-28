import type {
  ApplicationPayload,
  Job,
  JobFilters,
  JobMeta,
  JobPayload,
} from "@/lib/types";

export class ApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

const API_BASE_URL =
  (() => {
    const rawValue = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

    if (!rawValue) {
      return process.env.NODE_ENV === "development"
        ? "http://localhost:4000"
        : null;
    }

    const normalizedValue = rawValue.startsWith("http")
      ? rawValue
      : `https://${rawValue}`;

    try {
      return new URL(normalizedValue).toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  })();

const BACKEND_UNAVAILABLE_MESSAGE =
  "Jobs are unavailable because the backend API is not connected for this deployment yet.";

function buildUrl(path: string, params?: Record<string, string>) {
  if (!API_BASE_URL) {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  const url = new URL(path, API_BASE_URL);

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
  if (!API_BASE_URL) {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.errors?.join(" ") || data?.message || "Request failed. Please try again.";
    const fieldErrors: Record<string, string> = data?.fields || {};

    throw new ApiError(message, fieldErrors);
  }

  return data as T;
}

export async function fetchJobs(filters: JobFilters, signal?: AbortSignal) {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.location) params.location = filters.location;
  if (filters.employment_type) params.employment_type = filters.employment_type;
  if (filters.sort) params.sort = filters.sort;

  const url = buildUrl("/api/jobs", params);

  let response: Response;

  try {
    response = await fetch(url, { signal, cache: "no-store" });
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error("Unable to load job listings.");
  }

  const data = (await response.json()) as Job[];
  const total = response.headers.get("X-Total-Count");
  return { jobs: data, total: total ? Number(total) : data.length };
}

export async function fetchJob(jobId: string, signal?: AbortSignal) {
  if (!API_BASE_URL) {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      signal,
      cache: "no-store",
    });
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

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

const ADMIN_KEY =
  process.env.NEXT_PUBLIC_ADMIN_KEY || "quickhire-admin-secret";

export function createJob(payload: JobPayload) {
  return request<Job>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "X-Admin-Key": ADMIN_KEY },
  });
}

export async function deleteJob(jobId: number) {
  await request<void>(`/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": ADMIN_KEY },
  });
}

export function submitApplication(payload: ApplicationPayload) {
  return request("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
