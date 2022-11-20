import { gql } from "graphql-request";

export const TOWN_QUERY = gql`
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
            limit: 3
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
          food_cost
          gold_cost
          wood_cost
        }
      }
      resource_latest_claim {
        food_latest_claim_on
        gold_latest_claim_on
        wood_latest_claim_on
      }
      id
    }
    unit_enum {
      name
      gold_cost
      food_cost
      wood_cost
    }
    building_enum {
      base_food_cost
      base_gold_cost
      base_wood_cost
      name
    }
  }
`;
