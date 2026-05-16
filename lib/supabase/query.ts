export function throwOnSupabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}
