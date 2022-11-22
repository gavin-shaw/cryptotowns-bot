import { gql } from "graphql-request";
import { BuildingType, ResourceType, UnitType } from "./town-query";

export const TARGET_TOWNS_QUERY = gql`
  query GetTargetTowns(
    $maxWallTier: Int
    $maxPikeCount: Int
    $maxKnightCount: Int
    $maxHp: Int
    $minResources: Int
  ) {
    town(
      where: {
        active: { _eq: true }
        season: { active: { _eq: true } }
        resource: {
          food: { _gt: $minResources }
          wood: { _gt: $minResources }
          gold: { _gt: $minResources }
        }
        hp: { _lte: $maxHp }
      }
    ) {
      id
      hp
      token_id
      resource {
        food
        gold
        wood
      }
      buildings(where: { role: { _eq: "WALL" }, tier: { _gt: $maxWallTier } }) {
        role
        tier
      }
      units(
        where: {
          _or: [
            { role: { _eq: "PIKE" }, count: { _gt: $maxPikeCount } }
            { role: { _eq: "KNIGHT" }, count: { _gt: $maxKnightCount } }
          ]
        }
      ) {
        role
        count
      }
    }
  }
`;

export type TargetTownType = Readonly<{
  id: string;
  token_id: number;
  hp: number;
  resource: ResourceType;
  buildings: BuildingType[];
  units: UnitType[];
}>