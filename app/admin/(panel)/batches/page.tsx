import { parseListParams } from "@/lib/admin/resource-config";
import { listResource } from "@/lib/server/resource";
import { getActiveCatalog, blockedReason } from "@/lib/server/catalog";
import { batchesResource } from "@/lib/admin/resources/batches";
import { BatchesListView } from "./list-view";

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);
  const [{ rows, total }, cat] = await Promise.all([
    listResource(batchesResource, params),
    getActiveCatalog(),
  ]);

  // Batches whose coaching/exam has been turned off → locked in admin, with a reason.
  const blockedReasons: Record<string, string> = {};
  for (const b of rows) {
    const reason = blockedReason(b, cat);
    if (reason) blockedReasons[b.id] = reason;
  }

  return (
    <BatchesListView rows={rows} total={total} params={params} blockedReasons={blockedReasons} />
  );
}
