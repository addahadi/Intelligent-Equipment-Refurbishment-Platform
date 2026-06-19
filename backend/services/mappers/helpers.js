// Format a DB date/timestamp into a bare YYYY-MM-DD string (frontend contract).
// The postgres driver may hand back a JS Date (for `date` columns) or a string.
export function toDateString(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// bigint ids arrive as JS strings from the driver; the frontend wants numbers.
export function toNumber(value) {
  return value == null ? null : Number(value);
}
