import _ from "lodash";
import { query } from "./graphql-service";
import { blockNumber } from "./provider-service";
import { TOWN_QUERY } from "./queries/town-query";

export async function getTownState(tokenId: number): Promise<TownState> {
  const {
    town: towns,
    unit_enum: unitEnums,
    building_enum: buildingEnums,
  } = await query(TOWN_QUERY, { townId: tokenId });

  const town = towns[0];

  // @ts-ignore
  const buildings: Buildings = _(town.buildings)
    .keyBy("role")
    .mapValues("tier")
    .value();

  // @ts-ignore
  const units: Units = _(town.units).keyBy("role").mapValues("count").value();

  // @ts-ignore
  const unclaimedBuildings: Buildings = _(town.buildings)
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

  // @ts-ignore
  const inProgressBuildings: Buildings = _(town.buildings)
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

  const unclaimedUnits: UnitQueue[] = _(town.units)
    .flatMap((unit) =>
      _(unit.unit_enum.unit_train_logs)
        .filter((log) => log.complete_on <= blockNumber)
        .map((log) => _.pick(log, ["role", "count"]))
        .value()
    )
    .value();

  const inProgressUnits: UnitQueue[] = _(town.units)
    .flatMap((unit) =>
      _(unit.unit_enum.unit_train_logs)
        .filter((log) => log.complete_on > blockNumber)
        .map((log) => _.pick(log, ["role", "count"]))
        .value()
    )
    .value();

  const state: TownState = {
    id: town.id,
    tokenId: tokenId,
    resources: town.resource,
    buildings,
    units,
    unclaimed: {
      resources: {
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
      },
      buildings: unclaimedBuildings,
      units: unclaimedUnits,
    },
    inProgress: {
      buildings: inProgressBuildings,
      units: inProgressUnits,
    },
    buildingCosts: _(buildingEnums)
      .keyBy("name")
      .mapValues((buildingEnum) => ({
        food: buildingEnum.base_food_cost,
        wood: buildingEnum.base_wood_cost,
        gold: buildingEnum.base_gold_cost,
      }))
      .value(),
    unitCosts: _(unitEnums)
      .keyBy("name")
      .mapValues((unitEnum) => ({
        food: unitEnum.food_cost,
        wood: unitEnum.wood_cost,
        gold: unitEnum.gold_cost,
      }))
      .value(),
    totalCosts: {},
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

  totalCosts: Record<string, number>;
}

export interface UnitQueue {
  readonly role: string;
  readonly count: number;
}

export interface Units {
  readonly SWORD: number;
  readonly RAIDER: number;
  readonly PIKE: number;
  readonly KNIGHT: number;
  readonly TREBUCHET: number;
}

export interface Buildings {
  readonly WALL: number;
  readonly FARM: number;
  readonly SIEGE: number;
  readonly STABLE: number;
  readonly LUMBER: number;
  readonly HOUSING: number;
  readonly GOLD: number;
  readonly BARRACK: number;
  readonly TOWN_HALL: number;
}

export interface Resources {
  readonly wood: number;
  readonly food: number;
  readonly gold: number;
}

