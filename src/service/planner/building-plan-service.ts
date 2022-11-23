import _ from "lodash";
import { TownState } from "../town-service";
import { BUILDING_TARGETS } from "./plan";
import { affordable, Balance, Plan, spend } from "./plan-service";

export function addBuildingActions(
  state: TownState,
  balance: Balance,
  plan: Plan
) {
  const totalCost = _(state.totalCosts).values().sum();

  for (const [name, target] of BUILDING_TARGETS) {
    if (state.inProgress.buildings[name]) {
      continue;
    }

    const totalBuildingCost = state.totalCosts[name];

    if (totalBuildingCost * 100 / totalCost > target) {
      continue;
    }

    const toTier = state.buildings[name] + 1;

    const upgradeCost = state.buildingCosts[name];

    if (affordable(balance, upgradeCost)) {
      plan.push({
        type: "upgrade-building",
        params: [name, toTier],
      });

      spend(balance, upgradeCost);
    }
  }
}
