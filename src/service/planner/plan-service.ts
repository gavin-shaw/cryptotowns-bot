import { BUILDING_UPGRADE_ORDER, TrainingCap, UNIT_TRAIN_ORDER } from "./plan";
import { Resources, TownState } from "../town-service";
import _ from "lodash";
import { upgradeBuilding } from "../building-service";
import { info } from "../log-service";
import { trainUnits } from "../unit-service";
import { addBuildingActions } from "./building-plan-service";
import { addUnitActions } from "./unit-plan-service";

export function buildPlan(state: TownState): Plan {
  const balance = {
    wood: state.resources.wood + state.unclaimed.resources.wood,
    food: state.resources.food + state.unclaimed.resources.food,
    gold: state.resources.gold + state.unclaimed.resources.gold,
  };

  const plan: Plan = [];

  addBuildingActions(state, balance, plan);

  addUnitActions(state, balance, plan);

  return plan;
}

export async function executePlan(state: TownState, plan: Plan) {
  for (const action of plan) {
    switch (action.type) {
      case "upgrade-building":
        info(`Upgrading ${action.params[0]} to tier ${action.params[1]}`);

        await upgradeBuilding(state.id, action.params[0], action.params[1]);
      case "train-units":
        info(`Training ${action.params[1]} x ${action.params[0]}`);

        await trainUnits(state.id, action.params[0], action.params[1]);
    }
  }
}

export function spend(balance: Balance, amount: Resources) {
  balance.wood -= amount.wood;
  balance.food -= amount.food;
  balance.gold -= amount.gold;
}

export function affordable(balance: Balance, cost: Resources) {
  return (
    balance.wood - cost.wood > 0 &&
    balance.food - cost.food > 0 &&
    balance.gold - cost.gold > 0
  );
}

export type Plan = Action[];

export interface Action {
  readonly type: ActionType;
  readonly params: [string, number];
}

export type ActionType = "upgrade-building" | "train-units";

export interface Balance {
  wood: number;
  food: number;
  gold: number;
}

