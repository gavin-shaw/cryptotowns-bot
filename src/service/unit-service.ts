import _ from "lodash";
import { get, post } from "./rest-service";

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

export async function getTrainUnitMetadata(
  townId: string,
  unitName: string
): Promise<TrainUnitMetadata> {
  // Multiply and divide by count here as some units have sub 1 block train time, and we lose precision
  const count = 1000;

  const metadata = await get<TrainUnitMetadata>(
    `metadata/unit/train-resource/${townId}/${unitName}/${count}`
  );

  return _(metadata)
    .mapValues((value) => value / count)
    .value();
}

export function getTrainUnitMetadataMap(
  townId: string,
  units: Record<string, number>
): Promise<Record<string, TrainUnitMetadata>> {
  return _(units)
    .keys()
    .map((unitName) =>
      getTrainUnitMetadata(townId, unitName).then((metadata) => ({
        unitName,
        metadata,
      }))
    )
    .thru((promises) =>
      Promise.all(promises).then((results: []) =>
        _(results).keyBy("unitName").mapValues("metadata").value()
      )
    )
    .value();
}

type TrainUnitMetadata = Readonly<{
  wood: number;
  food: number;
  gold: number;
  housing: number;
  time: number;
}>;

export const DEFAULT_UNITS = {
  KNIGHT: 0,
  PIKE: 0,
  RAIDER: 0,
  SWORD: 0,
  TREBUCHET: 0,
};
