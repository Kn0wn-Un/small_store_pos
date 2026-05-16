import { randomUUID } from "node:crypto";

export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

  return base.length > 0 ? base : "item";
}

export function uniqueSlugFromName(name: string): string {
  return `${slugifyName(name)}-${randomUUID().slice(0, 8)}`;
}
