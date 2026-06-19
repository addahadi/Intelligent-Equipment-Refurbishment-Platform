// Resolves the response language from the ?lang query param (default 'fr').
export function resolveLang(req) {
  const lang = String(req.query.lang || '').toLowerCase();
  return lang === 'ar' ? 'ar' : 'fr';
}

// Collapse a bilingual pair to a single value for the requested language,
// falling back to the other language when the preferred one is empty.
export function pick(fr, ar, lang) {
  if (lang === 'ar') return ar ?? fr ?? null;
  return fr ?? ar ?? null;
}
