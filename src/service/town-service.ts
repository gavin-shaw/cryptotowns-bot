import _ from "lodash";
import {
  DEFAULT_BUILDINGS,
  getUpgradeBuildingMetadataMap,
} from "./building-service";
import { query } from "./graphql-service";
import { blockNumber } from "./provider-service";
import { TownType, TOWN_QUERY } from "./queries/town-query";
import { DEFAULT_UNITS, getTrainUnitMetadataMap } from "./unit-service";

export async function getTownState(tokenId: number): Promise<TownState> {
  const { town: towns } = await query<{ town: TownType[] }>(TOWN_QUERY, {
    tokenId,
  });

  const town = towns[0];

  const buildings = {
    ...DEFAULT_BUILDINGS,
    ..._(town.buildings).keyBy("role").mapValues("tier").value(),
  };

  const upgradeBuildingMetadataMap = await getUpgradeBuildingMetadataMap(
    town.id,
    buildings
  );

  const units = {
    ...DEFAULT_UNITS,
    ..._(town.units).keyBy("role").mapValues("count").value(),
  };

  const trainUnitMetadataMap = await getTrainUnitMetadataMap(town.id, units);

  const unclaimedBuildings = _(town.buildings)
    .filter(
      (building) =>
        building.building_enum.building_upgrade_logs.length > 0 &&
        building.building_enum.building_upgrade_logs[0].complete_on <=
          blockNumber
    )
    .keyBy("role")
    .mapValues(
      (building) => building.building_enum.building_upgrade_logs[0].to_tier
    )
    .value();

  const inProgressBuildings = _(town.buildings)
    .filter(
      (building) =>
        building.building_enum.building_upgrade_logs.length > 0 &&
        building.building_enum.building_upgrade_logs[0].complete_on >
          blockNumber
    )
    .keyBy("role")
    .mapValues(
      (building) => building.building_enum.building_upgrade_logs[0].to_tier
    )
    .value();

  const unclaimedUnits = _(town.units)
    .flatMap((unit) =>
      _(unit.unit_enum.unit_train_logs)
        .filter((log) => log.complete_on <= blockNumber)
        .map((log) => _.pick(log, ["role", "count"]))
        .value()
    )
    .value();

  const inProgressUnits = _(town.units)
    .flatMap((unit) =>
      _(unit.unit_enum.unit_train_logs)
        .filter((log) => log.complete_on > blockNumber)
        .map((log) => _.pick(log, ["role", "count"]))
        .value()
    )
    .value();

  const buildingEfficiency = _(upgradeBuildingMetadataMap)
    .mapValues((metadata) => metadata.upgradeMetrics.currentTier)
    .value();

  const unclaimedResources = {
    food: Math.floor(
      (blockNumber - town.resource_latest_claim.food_latest_claim_on) *
        buildings.FARM *
        1.2
    ),
    gold: Math.floor(
      (blockNumber - town.resource_latest_claim.gold_latest_claim_on) *
        buildings.GOLD *
        1.2
    ),
    wood: Math.floor(
      (blockNumber - town.resource_latest_claim.wood_latest_claim_on) *
        buildings.LUMBER *
        1.2
    ),
  };

  const state: TownState = {
    id: town.id,
    tokenId: tokenId,
    resources: town.resource,
    buildings,
    units,
    unclaimed: {
      resources: unclaimedResources,
      buildings: unclaimedBuildings,
      units: unclaimedUnits,
    },
    inProgress: {
      buildings: inProgressBuildings,
      units: inProgressUnits,
    },
    buildingCosts: _(upgradeBuildingMetadataMap)
      .mapValues((metadata) => _.pick(metadata, ["food", "wood", "gold", "time"]))
      .value(),
    unitCosts: _(trainUnitMetadataMap)
      .mapValues((metadata) => _.pick(metadata, ["food", "wood", "gold", "time"]))
      .value(),
    totalCosts: {},
    buildingEfficiency,
  };

  addTotalCosts(state);

  return state;
}

function addTotalCosts(state: TownState) {
  const allocation = {};

  for (const buildingName of _.keys(state.buildings)) {
    let cost = 0;

    for (let i = 1; i <= state.buildings[buildingName]; i++) {
      cost += Math.floor(
        _(state.buildingCosts[buildingName]).values().sum() * Math.pow(1.07, i)
      );
    }

    allocation[buildingName] = cost;
  }

  for (const unitName of _.keys(state.units)) {
    allocation[unitName] =
      _(state.unitCosts[unitName]).values().sum() * state.units[unitName];
  }

  state.totalCosts = allocation;
}

export interface TownState {
  readonly id: string;
  readonly tokenId: number;
  readonly resources: Resources;
  readonly buildings: Buildings;
  readonly buildingCosts: Record<string, Resources>;
  readonly unitCosts: Record<string, Resources>;
  readonly units: Units;

  readonly unclaimed: {
    readonly resources: Resources;
    readonly buildings: Buildings;
    readonly units: UnitQueue[];
  };

  readonly inProgress: {
    readonly buildings: Buildings;
    readonly units: UnitQueue[];
  };

  readonly buildingEfficiency: Record<string, number>;
  totalCosts: Record<string, number>;
}

export type UnitQueue = Readonly<{
  readonly role: string;
  readonly count: number;
}>;

export type Units = Readonly<Record<string, number>>;
export type Buildings = Readonly<Record<string, number>>;

export type Resources = Readonly<{
  wood: number;
  food: number;
  gold: number;
  time?: number;
}>;
