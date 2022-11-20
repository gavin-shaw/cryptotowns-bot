import { BUILDING_PRIORITY } from "../priority";
import { TownState } from "./town-service";
import _ from "lodash";
import { upgradeBuilding } from "./building-service";

export function buildPlan(state: TownState): Plan {
  const balance = {
    wood: state.resources.wood + state.unclaimed.resources.wood,
    food: state.resources.food + state.unclaimed.resources.food,
    gold: state.resources.gold + state.unclaimed.resources.gold,
  };

  const plan: Plan = [];

  for (const priorityRow of BUILDING_PRIORITY) {
    const newActions: Action[] = [];

    for (const building of priorityRow) {
      if (state.inProgress[building]) {
        continue;
      }

      const toTier = state.buildings[building] + 1;

      const cost = _(state.buildingCosts[building])
        .mapValues((it) => Math.floor(it * (1.07 ^ toTier)))
        .value();

      if (
        balance.wood - cost.wood > 0 &&
        balance.food - cost.food > 0 &&
        balance.gold - cost.gold > 0
      ) {
        newActions.push({
          type: "upgrade-building",
          params: [building, toTier],
        });

        balance.wood -= cost.wood;
        balance.food -= cost.food;
        balance.gold -= cost.gold;
      }
    }

    plan.push(...newActions);
  }

  return plan;
}

export async function executePlan(state: TownState, plan: Plan) {
  for (const action of plan) {
    switch (action.type) {
      case "upgrade-building":
        console.log(
          `Upgrading ${action.params[0]} to tier ${action.params[1]}`
        );
        await upgradeBuilding(state.id, action.params[0], action.params[1]);
    }
  }
}

export type Plan = Action[];

export interface Action {
  readonly type: "upgrade-building";
  readonly params: any[];
}
