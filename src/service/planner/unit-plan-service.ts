import _ from "lodash";
import { UNIT_QUEUE_MAX_MINUTES } from "../../config";
import { TownState } from "../town-service";
import { UNIT_TARGETS } from "./plan";
import { Action, affordable, Balance, Plan, spend } from "./plan-service";

export function addUnitActions(state: TownState, balance: Balance, plan: Plan) {
  let inProgressCount =
    state.inProgress.units.length + state.unclaimed.units.length;

  const totalCost = _(state.totalCosts).values().sum();

  const actions: Action[] = [];

  for (const [name, target] of UNIT_TARGETS) {
    if (inProgressCount >= 3) {
      break;
    }

    const totalUnitCost = state.totalCosts[name];

    if (totalUnitCost * 100 / totalCost > target) {
      continue;
    }

    const cost = state.unitCosts[name];

    if (!affordable(balance, cost)) {
      continue;
    }

    let trainCount = 0;

    while (affordable(balance, cost)) {
      trainCount++;

      spend(balance, cost);

      if (
        trainCount * state.unitCosts[name].time! >
        (UNIT_QUEUE_MAX_MINUTES * 60) / 12
      ) {
        break;
      }
    }

    if (trainCount) {
      actions.push({
        type: "train-units",
        params: [name, trainCount],
      });

      inProgressCount++;
    }
  }

  plan.push(...actions);
}
