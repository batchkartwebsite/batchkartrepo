import { parseListParams } from "@/lib/admin/resource-config";
import { listResource } from "@/lib/server/resource";
import { batchesResource } from "@/lib/admin/resources/batches";
import { BatchesListView } from "./list-view";

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);
  const { rows, total } = await listResource(batchesResource, params);
  return <BatchesListView rows={rows} total={total} params={params} />;
}
