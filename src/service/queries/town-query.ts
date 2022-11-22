import { gql } from "graphql-request";

export const TOWN_QUERY = gql`
  query GetTowns($tokenId: Int) {
    town(
      where: {
        _and: [
          { token_id: { _eq: $tokenId }, season: { active: { _eq: true } } }
        ]
      }
    ) {
      id
      token_id
      hp
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
                    token_id: { _eq: $tokenId }
                    season: { active: { _eq: true } }
                  }
                }
              ]
            }
          ) {
            role
            to_tier
            complete_on
          }
        }
      }
      units {
        role
        count
        unit_enum {
          unit_train_logs(
            limit: 3
            order_by: [{ created_on: desc }]
            where: {
              _and: [
                {
                  claimed: { _eq: false }
                  town: {
                    token_id: { _eq: $tokenId }
                    season: { active: { _eq: true } }
                  }
                }
              ]
            }
          ) {
            role
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
    }
  }
`;

export type TownType = Readonly<{
  id: string;
  token_id: number;
  hp: number;
  resource: ResourceType;
  buildings: BuildingType[];
  units: UnitType[];
  resource_latest_claim: ResourceLatestClaimType;
}>;

export type UnitType = Readonly<{
  role: string;
  count: number;
  unit_enum: UnitEnumType;
}>;

export type UnitEnumType = Readonly<{
  unit_train_logs: UnitTrainLogType[];
}>;

export type UnitTrainLogType = Readonly<{
  role: string;
  count: number;
  complete_on: number;
}>;

export type BuildingType = Readonly<{
  role: string;
  tier: number;
  building_enum: BuildingEnumType;
}>;

export type BuildingEnumType = Readonly<{
  building_upgrade_logs: BuildingUpgradeLogType[];
}>;

export type BuildingUpgradeLogType = Readonly<{
  role: string;
  to_tier: number;
  complete_on: number;
}>;

export type ResourceType = Readonly<{
  food: number;
  wood: number;
  gold: number;
}>;

export type ResourceLatestClaimType = Readonly<{
  food_latest_claim_on: number;
  gold_latest_claim_on: number;
  wood_latest_claim_on: number;
}>;
