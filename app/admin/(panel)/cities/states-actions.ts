"use server";

import {
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/server/resource";
import { statesResource } from "@/lib/admin/resources/states";

export const createState = createResource(statesResource);

const _update = updateResource(statesResource);
const _delete = deleteResource(statesResource);

export async function updateState(id: string, raw: unknown) {
  return _update(id, raw);
}

export async function deleteState(id: string) {
  return _delete(id);
}
