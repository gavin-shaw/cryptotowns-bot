import _ from "lodash";
import { get, post } from "./rest-service";

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

async function getUpgradeBuildingMetadata(
  townId: string,
  buildingName: string,
  toTier: number
): Promise<UpgradeBuildingMetadata> {
  return get<UpgradeBuildingMetadata>(
    `metadata/building/upgrade-resource/${townId}/${buildingName}/${toTier}`
  );
}

export function getUpgradeBuildingMetadataMap(
  townId: string,
  buildings: Record<string, number>
): Promise<Record<string, UpgradeBuildingMetadata>> {
  return _(buildings)
    .entries()
    .map(([buildingName, tier]) =>
      getUpgradeBuildingMetadata(townId, buildingName, tier + 1).then(
        (metadata) => ({
          buildingName,
          metadata,
        })
      )
    )
    .thru((promises) =>
      Promise.all(promises).then((results: []) =>
        _(results).keyBy("buildingName").mapValues("metadata").value()
      )
    )
    .value();
}
type UpgradeBuildingMetadata = Readonly<{
  wood: number;
  food: number;
  gold: number;
  time: number;
  upgradeMetrics: Readonly<{
    description: string;
    currentTier: number;
    nextTier: number;
  }>;
}>;

export const DEFAULT_BUILDINGS = {
  FARM: 0,
  WALL: 0,
  BARRACK: 0,
  GOLD: 0,
  SIEGE: 0,
  STABLE: 0,
  LUMBER: 0,
  HOUSING: 0,
  TOWN_HALL: 1,
}