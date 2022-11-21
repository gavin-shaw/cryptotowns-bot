import { post } from "./rest-service";

export function battle(townId: string, targetTownId: string) {
  return post("action/battle", { townId, targetTownId });
}
