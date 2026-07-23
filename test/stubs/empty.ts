// No-op stub aliased in place of the `server-only` package under vitest.
// `server-only` throws on import outside a React Server Component graph; this
// empty module lets server-only files be unit-tested without that guard firing.
export {};
