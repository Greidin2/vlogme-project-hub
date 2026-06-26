import resourcesData from "./resources.json";

export type LinkCategory = "common" | "content" | "publication" | "marketing" | "help" | "contact";

export type ResourceStatus = "ready" | "individual" | "missing" | "local";

export type WorkResource = {
  id: string;
  title: string;
  description: string;
  category: LinkCategory;
  status: ResourceStatus;
  external: boolean;
  buttonLabel: string;
  url?: string;
  note?: string;
};

export const resources = resourcesData as WorkResource[];

export function getResource(id: string): WorkResource {
  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    throw new Error(`Unknown resource id: ${id}`);
  }

  return resource;
}

export function getResources(ids: string[]): WorkResource[] {
  return ids.map(getResource);
}
