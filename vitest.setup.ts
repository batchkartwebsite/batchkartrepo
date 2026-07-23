// Dummy server-env defaults so eager module-level parseServerEnv() succeeds in tests
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-svc";
process.env.ADMIN_SESSION_SECRET ??= "t".repeat(32);

import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement window.matchMedia; mock it so next-themes works in tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
