import _ from "lodash";
import { BUILDING_UPGRADE_ORDER } from "./plan";
import { TownState } from "../town-service";
import { Balance, Plan, affordable, spend } from "./plan-service";

export function addBuildingActions(
  state: TownState,
  balance: Balance,
  plan: Plan
) {
  for (const row of BUILDING_UPGRADE_ORDER) {
    for (const role of row) {
      if (state.inProgress.buildings[role]) {
        continue;
      }

      const toTier = state.buildings[role] + 1;

      const cost = _(state.buildingCosts[role])
        .mapValues((baseCost) => Math.floor(baseCost * Math.pow(1.07, toTier)))
        .value();

      if (affordable(balance, cost)) {
        plan.push({
          type: "upgrade-building",
          params: [role, toTier],
        });

        spend(balance, cost);
      }
    }
  }
}
