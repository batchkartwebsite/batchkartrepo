"use server";

import {
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/server/resource";
import { categoriesResource } from "@/lib/admin/resources/categories";

export const createCategory = createResource(categoriesResource);

const _update = updateResource(categoriesResource);
const _delete = deleteResource(categoriesResource);

export async function updateCategory(id: string, raw: unknown) {
  return _update(id, raw);
}

export async function deleteCategory(id: string) {
  return _delete(id);
}
