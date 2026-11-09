export type DataSourceMode = "legacy" | "graphql";

function readMode(value: string | undefined): DataSourceMode {
  return value === "legacy" ? "legacy" : "graphql";
}

export const runtimeConfig = {
  dataSource: readMode(process.env.NEXT_PUBLIC_DATA_SOURCE),
  graphqlHttpUrl: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ?? "http://localhost:8000/graphql",
  graphqlWsUrl: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? "ws://localhost:8000/graphql",
};
