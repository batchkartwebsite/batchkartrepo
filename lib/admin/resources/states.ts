import { z } from "zod";
import type { ResourceConfig } from "@/lib/admin/resource-config";

/**
 * States resource config.
 *
 * IMPORTANT (RSC boundary): this module contains functions and a Zod schema
 * which cannot be passed as props from a Server Component to a Client Component.
 * Client components import this config DIRECTLY; Server Components only pass
 * serializable data (rows, total, plain params).
 */
export const statesResource: ResourceConfig<"states"> = {
  table: "states",
  label: { singular: "State", plural: "States" },
  searchColumns: ["name", "slug"],
  defaultSort: { column: "name", dir: "asc" },
  filters: [],
  listColumns: [
    { key: "name", header: "Name", cell: (r) => r.name },
    { key: "slug", header: "Slug", cell: (r) => r.slug },
    { key: "code", header: "Code", cell: (r) => r.code ?? "—" },
  ],
  form: {
    schema: z.object({
      name: z.string().min(1),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      code: z.string().optional(),
    }),
    fields: [
      { name: "name", type: "text", label: "Name" },
      { name: "slug", type: "slug", label: "Slug", from: "name" },
      { name: "code", type: "text", label: "Code" },
    ],
  },
};
