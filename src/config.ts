import { environment } from "./util/environment";

export const TOWN_TOKEN_IDS = environment("TOWN_TOKEN_ID")
  .trim()
  .split(",")
  .map((id) => Number(id));

export const WALLET_PHRASE = environment("WALLET_PHRASE");

export const REST_BASE_URL = environment("REST_BASE_URL", {
  default: "https://cryptotowns-server.herokuapp.com",
});

export const GRAPHQL_URL = environment("GRAPHQL_URL", {
  default: "https://cryptotowns-hasura.herokuapp.com/v1/graphql",
});

export const UNIT_QUEUE_MAX_MINUTES = environment("UNIT_QUEUE_MAX_MINUTES", {
  default: 2,
  cast: Number,
});
