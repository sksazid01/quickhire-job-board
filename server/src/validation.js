const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireText(value, fieldName, key) {
  if (typeof value !== "string" || !value.trim()) {
    return { message: `${fieldName} is required.`, key };
  }
  return null;
}

function requireUrl(value, fieldName, key) {
  if (typeof value !== "string" || !value.trim()) {
    return { message: `${fieldName} is required.`, key };
  }
  try {
    new URL(value);
    return null;
  } catch {
    return { message: `${fieldName} must be a valid URL.`, key };
  }
}

export function validateJobPayload(payload) {
  const rawErrors = [
    requireText(payload.title, "Title", "title"),
    requireText(payload.company, "Company", "company"),
    requireText(payload.location, "Location", "location"),
    requireText(payload.category, "Category", "category"),
    requireText(payload.description, "Description", "description"),
    requireText(payload.employment_type, "Employment type", "employment_type"),
    requireText(payload.salary_range, "Salary range", "salary_range"),
  ].filter(Boolean);

  const fieldErrors = Object.fromEntries(rawErrors.map((e) => [e.key, e.message]));
  const errors = rawErrors.map((e) => e.message);

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
}

export function validateApplicationPayload(payload) {
  const rawErrors = [
    requireText(payload.name, "Name", "name"),
    requireText(payload.email, "Email", "email"),
    requireUrl(payload.resume_link, "Resume link", "resume_link"),
    requireText(payload.cover_note, "Cover note", "cover_note"),
  ].filter(Boolean);

  if (payload.email && !emailPattern.test(payload.email.trim())) {
    rawErrors.push({ message: "Email must be properly formatted.", key: "email" });
  }

  const fieldErrors = Object.fromEntries(rawErrors.map((e) => [e.key, e.message]));
  const errors = rawErrors.map((e) => e.message);

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
}
