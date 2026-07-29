import "server-only";

/**
 * Log the real error server-side and return a safe, generic message for the
 * client. Raw Postgres/Supabase error text can disclose table names, column
 * names, and constraint details, so it must never reach the browser.
 *
 * Validation messages (from Zod) and deliberately friendly messages (e.g.
 * "That exam already exists.") are safe and should be returned directly — only
 * pass *unexpected* / raw DB errors through here.
 */
export function failAction(
  context: string,
  error: unknown,
  userMessage = "Something went wrong. Please try again.",
): { ok: false; error: string } {
  console.error(`[action:${context}]`, error);
  return { ok: false as const, error: userMessage };
}
