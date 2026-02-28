export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  employment_type: string;
  salary_range: string;
  created_at: string;
  application_count: number;
};

export type JobFilters = {
  search: string;
  category: string;
  location: string;
  employment_type: string;
  sort: "newest" | "oldest" | "applications" | "";
};

export type JobMeta = {
  categories: string[];
  locations: string[];
  employment_types: string[];
};

export type JobPayload = {
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  employment_type: string;
  salary_range: string;
};

export type ApplicationPayload = {
  job_id: number;
  name: string;
  email: string;
  resume_link: string;
  cover_note: string;
};
