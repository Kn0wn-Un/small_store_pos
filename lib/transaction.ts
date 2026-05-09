import { db } from "@/db";

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withTransaction<T>(callback: (tx: DbTransaction) => Promise<T>) {
  return db.transaction(callback);
}
