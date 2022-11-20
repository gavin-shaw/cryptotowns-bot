import { post } from "./rest-service";

export function claimUnitUpgrades(townId: string) {
  return post("claim/unit-train", { townId });
}

export function trainUnits(
  townId: string,
  unitName: string,
  unitCount: number
) {
  return post("queue/unit-train", { townId, unitName, unitCount });
}
