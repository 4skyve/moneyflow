/**
 * lib/actions.ts functions are written to accept FormData (because the website
 * calls them directly as React Server Actions from <form action={...}>).
 * The mobile REST API receives JSON instead. Rather than writing a second copy
 * of every action that accepts a plain object (business logic duplication),
 * we convert the validated JSON body into a FormData object and call the
 * exact same action function. This file is pure plumbing - no business rules.
 */
export function toFormData(obj: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    fd.set(key, String(value));
  }
  return fd;
}
