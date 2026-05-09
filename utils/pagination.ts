export function getPagination(input: { page?: number; pageSize?: number; defaultPageSize?: number; maxPageSize?: number }) {
  const page = Math.max(1, input.page ?? 1);
  const defaultPageSize = input.defaultPageSize ?? 20;
  const maxPageSize = input.maxPageSize ?? 100;
  const pageSize = Math.max(1, Math.min(input.pageSize ?? defaultPageSize, maxPageSize));

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}
