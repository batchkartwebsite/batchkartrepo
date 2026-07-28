import { z } from "zod";
import type { ResourceConfig } from "@/lib/admin/resource-config";

/**
 * Batches resource config — the single admin-managed catalogue in V1.
 * Standalone listing (no coaching/exam relations): the institute name, exam and
 * city are plain fields. `autoPublish: true` so admin-created batches go live.
 *
 * The admin form (batch-form.tsx) reveals fields progressively: exam first,
 * then coaching + batch name, then the remaining details.
 *
 * RSC boundary: client components import this config directly; server pages pass
 * only serializable data.
 */
const emptyToNull = (v: unknown) => (v === "" ? null : v);

export const EXAM_OPTIONS = [
  { label: "NEET", value: "NEET" },
  { label: "JEE Main", value: "JEE Main" },
  { label: "JEE Advanced", value: "JEE Advanced" },
  { label: "UPSC CSE", value: "UPSC CSE" },
  { label: "State PSC", value: "State PSC" },
  { label: "SSC CGL", value: "SSC CGL" },
  { label: "Bank PO", value: "Bank PO" },
  { label: "CAT", value: "CAT" },
  { label: "GATE", value: "GATE" },
  { label: "CLAT", value: "CLAT" },
  { label: "NDA", value: "NDA" },
  { label: "CUET", value: "CUET" },
  { label: "Board Exams (11-12)", value: "Board Exams (11-12)" },
];

const MODE_OPTIONS = [
  { label: "Offline", value: "offline" },
  { label: "Online", value: "online" },
  { label: "Hybrid", value: "hybrid" },
];
const LANGUAGE_OPTIONS = [
  { label: "Hinglish", value: "hinglish" },
  { label: "Hindi", value: "hindi" },
  { label: "English", value: "english" },
  { label: "Regional", value: "regional" },
];
const FEE_TYPE_OPTIONS = [
  { label: "One-time", value: "one_time" },
  { label: "EMI", value: "emi" },
];
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

/** Sensible defaults for the create form so enum selects submit a valid value. */
export const batchCreateDefaults = {
  mode: "offline",
  language: "hinglish",
  fee_type: "one_time",
  status: "active",
  scholarship_available: false,
};

export const batchesResource: ResourceConfig<"batches"> = {
  table: "batches",
  label: { singular: "Batch", plural: "Batches" },
  searchColumns: ["name", "institute_name", "exam", "city"],
  defaultSort: { column: "created_at", dir: "desc" },
  autoPublish: true,
  filters: [
    { key: "exam", type: "enum", label: "Exam", options: EXAM_OPTIONS },
    { key: "mode", type: "enum", label: "Mode", options: MODE_OPTIONS },
    { key: "status", type: "enum", label: "Status", options: STATUS_OPTIONS },
  ],
  listColumns: [
    { key: "name", header: "Name", cell: (r) => r.name },
    { key: "institute_name", header: "Coaching", cell: (r) => r.institute_name ?? "—" },
    { key: "exam", header: "Exam", cell: (r) => r.exam ?? "—" },
    { key: "city", header: "City", cell: (r) => r.city ?? "—" },
    { key: "mode", header: "Mode", cell: (r) => r.mode },
    { key: "fee", header: "Fee", cell: (r) => (r.fee != null ? `₹${r.fee}` : "—") },
    { key: "status", header: "Status", cell: (r) => r.status },
  ],
  form: {
    schema: z.object({
      // Step 1 — entry point
      exam: z.string().min(1, "Please select an exam"),
      // Step 2 — coaching + batch
      institute_name: z.string().min(1, "Enter the coaching / institute name"),
      name: z.string().min(1, "Enter a batch name"),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      // Step 3 — details
      city: z.string().optional(),
      teacher: z.string().optional(),
      mode: z.enum(["online", "offline", "hybrid"]).default("offline"),
      language: z.enum(["english", "hindi", "hinglish", "regional"]).default("hinglish"),
      fee: z.preprocess(emptyToNull, z.coerce.number().nullish()),
      discounted_fee: z.preprocess(emptyToNull, z.coerce.number().nullish()),
      fee_type: z.enum(["one_time", "emi"]).default("one_time"),
      start_date: z.preprocess(emptyToNull, z.string().nullish()),
      duration_months: z.preprocess(emptyToNull, z.coerce.number().int().nullish()),
      seats_total: z.preprocess(emptyToNull, z.coerce.number().int().nullish()),
      scholarship_available: z.boolean().default(false),
      status: z.enum(["active", "inactive", "archived"]).default("active"),
      description: z.string().optional(),
    }),
    // Field order matters — the form renders them in these steps.
    fields: [
      { name: "exam", type: "select", label: "Exam", options: EXAM_OPTIONS },
      { name: "institute_name", type: "text", label: "Coaching / Institute name" },
      { name: "name", type: "text", label: "Batch name" },
      { name: "slug", type: "slug", label: "Slug", from: "name" },
      { name: "city", type: "text", label: "City" },
      { name: "teacher", type: "text", label: "Teacher" },
      { name: "mode", type: "select", label: "Mode", options: MODE_OPTIONS },
      { name: "language", type: "select", label: "Language", options: LANGUAGE_OPTIONS },
      { name: "fee", type: "number", label: "Fee (₹)" },
      { name: "discounted_fee", type: "number", label: "Discounted fee (₹)" },
      { name: "fee_type", type: "select", label: "Fee type", options: FEE_TYPE_OPTIONS },
      { name: "start_date", type: "date", label: "Start date" },
      { name: "duration_months", type: "number", label: "Duration (months)" },
      { name: "seats_total", type: "number", label: "Total seats" },
      { name: "scholarship_available", type: "switch", label: "Scholarship available" },
      { name: "status", type: "select", label: "Status", options: STATUS_OPTIONS },
      { name: "description", type: "textarea", label: "Description" },
    ],
  },
};
