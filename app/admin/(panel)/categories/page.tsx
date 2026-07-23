import { parseListParams } from "@/lib/admin/resource-config";
import { listResource } from "@/lib/server/resource";
import { categoriesResource } from "@/lib/admin/resources/categories";
import { CategoriesListView } from "./list-view";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);
  const { rows, total } = await listResource(categoriesResource, params);
  return <CategoriesListView rows={rows} total={total} params={params} />;
}
