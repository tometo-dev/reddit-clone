import { QueryInput, Cache } from "@urql/exchange-graphcache";

export function customUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  updateFn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(
    queryInput,
    (data) => updateFn(result, data as any) as any
  );
}
