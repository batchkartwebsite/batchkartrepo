import Link from "next/link";
import { CategoryForm } from "../category-form";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/admin/categories"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          &larr; Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          New Category
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}
