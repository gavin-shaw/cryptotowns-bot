import { gql } from "graphql-request";

export const TOWNS_QUERY = gql`
  query GetTowns {
    town(
      where: { season: { active: { _eq: true } } }
    ) {
      resource {
        food
        gold
        wood
      }
      buildings {
        role
        tier
      }
      hp
      token_id
      units {
        role
        count
      }
      id
    }
  }
`;
