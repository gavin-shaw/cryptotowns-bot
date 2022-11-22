import { request } from "graphql-request";
import { GRAPHQL_URL } from "../config";

export async function query<T>(query: any, variables: any): Promise<T> {
  const result = await request(GRAPHQL_URL, query, variables);

  return result as T;
}
