"use server";

import {
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/server/resource";
import { citiesResource } from "@/lib/admin/resources/cities";

export const createCity = createResource(citiesResource);

const _update = updateResource(citiesResource);
const _delete = deleteResource(citiesResource);

export async function updateCity(id: string, raw: unknown) {
  return _update(id, raw);
}

export async function deleteCity(id: string) {
  return _delete(id);
}
