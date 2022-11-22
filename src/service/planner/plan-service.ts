import { battle } from "../battle-service";
import { upgradeBuilding } from "../building-service";
import { info } from "../log-service";
import { Resources, TownState } from "../town-service";
import { trainUnits } from "../unit-service";
import { addAttackActions, TargetTown } from "./attack-plan-service";
import { addBuildingActions } from "./building-plan-service";
import { addUnitActions } from "./unit-plan-service";

export async function buildPlan(state: TownState): Promise<Plan> {
  const balance = {
    wood: state.resources.wood + state.unclaimed.resources.wood,
    food: state.resources.food + state.unclaimed.resources.food,
    gold: state.resources.gold + state.unclaimed.resources.gold,
  };

  const plan: Plan = [];

  addBuildingActions(state, balance, plan);

  addUnitActions(state, balance, plan);

  await addAttackActions(state, plan);

  return plan;
}

export async function executePlan(state: TownState, plan: Plan) {
  for (const action of plan) {
    switch (action.type) {
      case "upgrade-building":
        info(`Upgrading ${action.params[0]} to tier ${action.params[1]}`);

        await upgradeBuilding(state.id, action.params[0], action.params[1]);
        break;
      case "train-units":
        info(`Training ${action.params[1]} x ${action.params[0]}`);

        await trainUnits(state.id, action.params[0], action.params[1]);
        break;
      case "battle":
        info(
          `Battling Town #${action.params[1]} for ${action.params[2]} resources at distance ${action.params[3]}`
        );

        await battle(state.id, action.params[0]);
        break;
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
  readonly params: any[];
}

export type ActionType = "upgrade-building" | "train-units" | "battle";

export interface Balance {
  wood: number;
  food: number;
  gold: number;
}
