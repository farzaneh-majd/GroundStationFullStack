import { runtimeConfig } from "@/config/runtime";

type GraphQLErrorItem = { message?: string };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLErrorItem[] };

export async function executeGraphQL<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string,
  variables?: TVariables,
  signal?: AbortSignal,
): Promise<TData> {
  const response = await fetch(runtimeConfig.graphqlHttpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: variables ?? {} }),
    cache: "no-store",
    signal,
  });

  let body: GraphQLResponse<TData>;
  try {
    body = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new Error(`GraphQL endpoint returned HTTP ${response.status} with a non-JSON response.`);
  }

  if (!response.ok || body.errors?.length) {
    const details = body.errors?.map((item) => item.message).filter(Boolean).join("; ");
    throw new Error(details || `GraphQL request failed (${response.status}).`);
  }
  if (!body.data) throw new Error("GraphQL response did not contain data.");
  return body.data;
}
