import { post } from "./rest-service";

export function claimBuildingUpgrades(townId: string) {
  return post("claim/building-upgrade", { townId });
}

export function upgradeBuilding(
  townId: string,
  buildingName: string,
  buildingToTier: number
) {
  return post("queue/building-upgrade", {
    townId,
    buildingName,
    buildingToTier,
  });
}
