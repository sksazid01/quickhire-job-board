const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    return `${fieldName} is required.`;
  }

  return null;
}

function requireUrl(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    return `${fieldName} is required.`;
  }

  try {
    new URL(value);
    return null;
  } catch {
    return `${fieldName} must be a valid URL.`;
  }
}

export function validateJobPayload(payload) {
  const errors = [
    requireText(payload.title, "Title"),
    requireText(payload.company, "Company"),
    requireText(payload.location, "Location"),
    requireText(payload.category, "Category"),
    requireText(payload.description, "Description"),
    requireText(payload.employment_type, "Employment type"),
    requireText(payload.salary_range, "Salary range"),
  ].filter(Boolean);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateApplicationPayload(payload) {
  const errors = [
    requireText(payload.name, "Name"),
    requireText(payload.email, "Email"),
    requireUrl(payload.resume_link, "Resume link"),
    requireText(payload.cover_note, "Cover note"),
  ].filter(Boolean);

  if (payload.email && !emailPattern.test(payload.email.trim())) {
    errors.push("Email must be properly formatted.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
