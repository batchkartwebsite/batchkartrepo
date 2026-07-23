import { z } from "zod";
import type { ResourceConfig } from "@/lib/admin/resource-config";

/**
 * Cities resource config.
 *
 * IMPORTANT (RSC boundary): this module contains functions and a Zod schema
 * which cannot be passed as props from a Server Component to a Client Component.
 * Client components import this config DIRECTLY; Server Components only pass
 * serializable data (rows, total, plain params).
 *
 * Relation-dropdown pattern: the `state_id` field uses type "relation".
 * Options are NOT embedded here (they are dynamic data). The city form client
 * component accepts a `relationOptions` prop and merges them at render time.
 */
export const citiesResource: ResourceConfig<"cities"> = {
  table: "cities",
  label: { singular: "City", plural: "Cities" },
  searchColumns: ["name", "slug"],
  defaultSort: { column: "name", dir: "asc" },
  filters: [
    { key: "is_popular", type: "boolean", label: "Popular" },
    // state_id filter uses type "relation"; options are injected at render time
    // by the list-view component (server fetches state options, passes as prop).
    { key: "state_id", type: "relation", label: "State" },
  ],
  listColumns: [
    { key: "name", header: "Name", cell: (r) => r.name },
    { key: "slug", header: "Slug", cell: (r) => r.slug },
    { key: "is_popular", header: "Popular", cell: (r) => (r.is_popular ? "Yes" : "No") },
  ],
  form: {
    schema: z.object({
      // Relation inputs submit "" when empty — normalise to null before validating.
      state_id: z.preprocess(
        (v) => (v === "" ? null : v),
        z.string().uuid("A valid state is required"),
      ),
      name: z.string().min(1),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      is_popular: z.boolean().default(false),
      latitude: z.coerce.number().nullish(),
      longitude: z.coerce.number().nullish(),
    }),
    fields: [
      { name: "state_id", type: "relation", label: "State" },
      { name: "name", type: "text", label: "Name" },
      { name: "slug", type: "slug", label: "Slug", from: "name" },
      { name: "is_popular", type: "switch", label: "Popular" },
      { name: "latitude", type: "number", label: "Latitude" },
      { name: "longitude", type: "number", label: "Longitude" },
    ],
  },
};
