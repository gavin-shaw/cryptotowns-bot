import _ from "lodash";
import { TownState } from "../town-service";
import { BUILDING_WEIGHTS, UNIT_WEIGHTS } from "./plan";
import { Action, affordable, Balance, Plan, spend } from "./plan-service";
import { UNIT_QUEUE_MAX_MINUTES } from "../../config";

export function addUnitActions(state: TownState, balance: Balance, plan: Plan) {
  let inProgressCount =
    state.inProgress.units.length + state.unclaimed.units.length;

  const totalCost = _(state.totalCosts).values().sum();
  const totalWeight =
    _(BUILDING_WEIGHTS).map(1).sum() + _(UNIT_WEIGHTS).map(1).sum();

  const actions: Action[] = [];

  for (const [name, weight] of UNIT_WEIGHTS) {
    if (inProgressCount >= 3) {
      break;
    }

    const totalUnitCost = state.totalCosts[name];

    if (totalUnitCost / totalCost > weight / totalWeight) {
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
