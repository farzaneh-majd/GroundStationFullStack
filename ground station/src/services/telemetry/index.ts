import { runtimeConfig } from "@/config/runtime";
import { graphQLTelemetryDataSource } from "./graphql";
import { legacyTelemetryDataSource } from "./legacy";
export const telemetryDataSource = runtimeConfig.dataSource === "graphql" ? graphQLTelemetryDataSource : legacyTelemetryDataSource;
export { runtimeConfig } from "@/config/runtime";
