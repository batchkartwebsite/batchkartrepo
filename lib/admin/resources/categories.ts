import { z } from "zod";
import type { ResourceConfig } from "@/lib/admin/resource-config";

/**
 * Categories resource config — the CRUD template.
 *
 * IMPORTANT (RSC boundary): this module contains functions (`listColumns[].cell`)
 * and a Zod schema, which cannot be passed as props from a Server Component to a
 * Client Component. Client components therefore import this config *directly*;
 * Server Components only pass serializable data (rows, total, plain params).
 */
export const categoriesResource: ResourceConfig<"exam_categories"> = {
  table: "exam_categories",
  label: { singular: "Category", plural: "Categories" },
  searchColumns: ["name", "slug"],
  defaultSort: { column: "sort_order", dir: "asc" },
  filters: [{ key: "is_active", type: "boolean", label: "Active" }],
  listColumns: [
    { key: "name", header: "Name", cell: (r) => r.name },
    { key: "slug", header: "Slug", cell: (r) => r.slug },
    { key: "sort_order", header: "Order", cell: (r) => String(r.sort_order) },
    { key: "is_active", header: "Active", cell: (r) => (r.is_active ? "Yes" : "No") },
  ],
  form: {
    schema: z.object({
      name: z.string().min(1),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      icon: z.string().optional(),
      // Relation inputs submit "" when empty — normalise to null before validating.
      parent_id: z
        .preprocess((v) => (v === "" ? null : v), z.string().uuid().nullish()),
      description: z.string().optional(),
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
    fields: [
      { name: "name", type: "text", label: "Name" },
      { name: "slug", type: "slug", label: "Slug", from: "name" },
      { name: "icon", type: "text", label: "Icon (lucide name)" },
      { name: "parent_id", type: "relation", label: "Parent" },
      { name: "description", type: "textarea", label: "Description" },
      { name: "sort_order", type: "number", label: "Sort order" },
      { name: "is_active", type: "switch", label: "Active" },
    ],
  },
};
