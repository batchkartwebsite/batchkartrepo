"use server";

import {
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/server/resource";
import { batchesResource } from "@/lib/admin/resources/batches";

export const createBatch = createResource(batchesResource);

const _update = updateResource(batchesResource);
const _delete = deleteResource(batchesResource);

export async function updateBatch(id: string, raw: unknown) {
  return _update(id, raw);
}

export async function deleteBatch(id: string) {
  return _delete(id);
}
