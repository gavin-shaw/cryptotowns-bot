import _ from "lodash";
import { BUILDING_WEIGHTS, UNIT_WEIGHTS } from "./plan";
import { TownState } from "../town-service";
import { Balance, Plan, affordable, spend } from "./plan-service";

export function addBuildingActions(
  state: TownState,
  balance: Balance,
  plan: Plan
) {
  const totalCost = _(state.totalCosts).values().sum();
  const totalWeight = _(BUILDING_WEIGHTS).map(1).sum() + _(UNIT_WEIGHTS).map(1).sum()

  for (const [name, weight] of BUILDING_WEIGHTS) {

    if (state.inProgress.buildings[name]) {
      continue;
    }

    const totalBuildingCost = state.totalCosts[name];

    if ((totalBuildingCost / totalCost) > (weight / totalWeight)) {
      continue
    }

    const toTier = state.buildings[name] + 1;

    const upgradeCost = state.buildingCosts[name]

    if (affordable(balance, upgradeCost)) {
      plan.push({
        type: "upgrade-building",
        params: [name, toTier],
      });

      spend(balance, upgradeCost);
    }
  }
}
