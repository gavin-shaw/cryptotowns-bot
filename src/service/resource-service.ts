import { post } from "./rest-service";

export function claimResources(townId: string) {
  return post("claim/resource-generation", { townId });
}
