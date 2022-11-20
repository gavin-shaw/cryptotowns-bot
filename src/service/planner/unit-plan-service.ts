import _ from "lodash";
import { TownState } from "../town-service";
import { TrainingCap, TrainingGroup, UNIT_TRAIN_ORDER } from "./plan";
import {
  Action,
  ActionType,
  affordable,
  Balance,
  Plan,
  spend,
} from "./plan-service";

export function addUnitActions(state: TownState, balance: Balance, plan: Plan) {
  let inProgressCount = state.inProgress.units.length;

  if (inProgressCount >= 3) {
    return;
  }

  const actions: Action[] = [];

  for (const trainingGroup of UNIT_TRAIN_ORDER) {
    let unitCapsToTrain = removeAlreadyTrainingUnits(state, trainingGroup);

    unitCapsToTrain = _.take(unitCapsToTrain, 3 - inProgressCount);

    if (unitCapsToTrain.length == 0) {
      continue;
    }

    const trainingCounts = _(unitCapsToTrain)
      .keyBy(0)
      .mapValues(() => 0)
      .value();

    while (
      trainOneOfEachRole(state, balance, unitCapsToTrain, trainingCounts)
    ) {}

    if (_(trainingCounts).values().sum() == 0) {
      continue;
    }

    const newActions = _(trainingCounts)
      .entries()
      .filter(([, count]) => count > 0)
      .map((params: [string, number]) => ({
        type: "train-units" as ActionType,
        params,
      }))
      .value();

    actions.push(...newActions);

    inProgressCount += newActions.length;
  }

  plan.push(...actions);
}

function removeAlreadyTrainingUnits(
  state: TownState,
  trainingGroup: TrainingGroup
) {
  return _(trainingGroup)
    .filter(
      ([unitName]) =>
        !_.some(state.inProgress.units, (log) => log.role == unitName)
    )
    .value();
}

function trainOneOfEachRole(
  state: TownState,
  balance: Balance,
  unitCaps: TrainingCap[],
  trainingCounts: Record<string, number>
) {
  const unitsTrained = _(unitCaps)
    .keyBy(0)
    .mapValues(() => 0)
    .value();

  for (const [unitName, cap] of unitCaps) {
    const cost = state.unitCosts[unitName];

    if (trainingCounts[unitName] >= cap) {
      continue;
    }

    if (!affordable(balance, cost)) {
      continue;
    }

    unitsTrained[unitName] = 1;
    spend(balance, cost);
  }

  const unitsTrainedSum = _(unitsTrained).values().sum();

  if (unitsTrainedSum == 0) {
    return 0;
  }

  for (const role of _.keys(unitsTrained)) {
    trainingCounts[role] += unitsTrained[role];
  }

  return unitsTrainedSum;
}
