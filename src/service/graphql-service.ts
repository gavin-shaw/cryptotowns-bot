import { request, gql } from "graphql-request";

const URL =
  process.env.GRAPHQL_URL ??
  "https://cryptotowns-hasura.herokuapp.com/v1/graphql";

export function query(query: any, variables: any) {
  return request(URL, query, variables);
}

