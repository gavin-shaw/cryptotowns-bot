import { request, gql } from "graphql-request";
import _ from "lodash";
import { blockNumber } from "./provider-service";

function query(query: any, variables: any) {
  return request(
    "https://cryptotowns-hasura.herokuapp.com/v1/graphql",
    query,
    variables
  );
}

export async function getTownState(townId: number): Promise<TownState> {
  const QUERY = gql`
    query GetTowns($townId: Int) {
      town(
        where: {
          _and: [
            { token_id: { _eq: $townId }, season: { active: { _eq: true } } }
          ]
        }
      ) {
        resource {
          food
          gold
          wood
        }
        buildings {
          role
          tier
          building_enum {
            building_upgrade_logs(
              limit: 1
              order_by: [{ created_on: desc }]
              where: {
                _and: [
                  {
                    claimed: { _eq: false }
                    town: {
                      token_id: { _eq: $townId }
                      season: { active: { _eq: true } }
                    }
                  }
                ]
              }
            ) {
              to_tier
              complete_on
            }
          }
        }
        hp
        units {
          role
          count
          unit_enum {
            unit_train_logs(
              limit: 1
              order_by: [{ created_on: desc }]
              where: {
                _and: [
                  {
                    claimed: { _eq: false }
                    town: {
                      token_id: { _eq: $townId }
                      season: { active: { _eq: true } }
                    }
                  }
                ]
              }
            ) {
              count
              complete_on
            }
          }
        }
        resource_latest_claim {
          food_latest_claim_on
          gold_latest_claim_on
          wood_latest_claim_on
        }
        id
      }
    }
  `;

  const VARIABLES = { townId };

  let { town } = await query(QUERY, VARIABLES);

  town = town[0];

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

  // @ts-ignore
  const unclaimedUnits: Units = _(town.units)
    .filter(
      (unit) =>
        unit.unit_enum.unit_train_logs.length > 0 &&
        unit.unit_enum.unit_train_logs[0].complete_on <= blockNumber
    )
    .keyBy("role")
    .mapValues((unit) => unit.unit_enum.unit_train_logs[0].count)
    .value();

  // @ts-ignore
  const inProgressUnits: Units = _(town.units)
    .filter(
      (unit) =>
        unit.unit_enum.unit_train_logs.length > 0 &&
        unit.unit_enum.unit_train_logs[0].complete_on > blockNumber
    )
    .keyBy("role")
    .mapValues((unit) => unit.unit_enum.unit_train_logs[0].count)
    .value();

  return {
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
  };
}

interface TownState {
  readonly resources: Resources;
  readonly buildings: Buildings;
  readonly units: Units;

  readonly unclaimed: {
    readonly resources: Resources;
    readonly buildings: Buildings;
    readonly units: Units;
  };

  readonly inProgress: {
    readonly buildings: Buildings;
    readonly units: Units;
  };
}

interface Units {
  readonly SWORD: number;
  readonly RAIDER: number;
  readonly PIKE: number;
  readonly KNIGHT: number;
  readonly TREBUCHET: number;
}

interface Buildings {
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
interface Resources {
  readonly wood: number;
  readonly food: number;
  readonly gold: number;
}
