import { runtimeConfig } from "@/config/runtime";
import { graphQLCommandDataSource } from "./graphql";
import { legacyCommandDataSource } from "./legacy";
export const commandDataSource = runtimeConfig.dataSource === "graphql" ? graphQLCommandDataSource : legacyCommandDataSource;
