require("dotenv").config();

import _ from "lodash";
import { TOWN_TOKEN_IDS } from "./config";
import { authenticate } from "./service/auth-service";
import { claimBuildingUpgrades } from "./service/building-service";
import { debug, error, info } from "./service/log-service";
import { BUILDING_WEIGHTS, UNIT_WEIGHTS } from "./service/planner/plan";
import { buildPlan, executePlan } from "./service/planner/plan-service";
import { initProvider } from "./service/provider-service";
import { claimResources } from "./service/resource-service";
import { getTownState, TownState } from "./service/town-service";
import { claimUnitUpgrades } from "./service/unit-service";

(async () => {
  info("Fetching block number...");

  await initProvider();

  info("Authenticating...");

  await authenticate();

  info("Fetching all towns...");

  for (const townTokenId of TOWN_TOKEN_IDS) {
    info(`Processing town ${townTokenId}`);

    try {
      await processTown(townTokenId);
    } catch (ex) {
      error("Error occurred");
      debug(ex);
    }
  }

  process.exit();
})();

async function processTown(townTokenId: number) {
  info("Getting town state...");

  let state = await getTownState(townTokenId);

  let stateStale = false;

  if (_(state.unclaimed.buildings).keys().size() > 0) {
    info("Claiming buildings...");

    await claimBuildingUpgrades(state.id);

    stateStale = true;
  }

  if (_(state.unclaimed.units).keys().size() > 0) {
    info("Claiming units...");

    await claimUnitUpgrades(state.id);

    stateStale = true;
  }

  if (stateStale) {
    info("Getting town state...");

    state = await getTownState(townTokenId);
  }

  info("Town state:");

  debug(_.omit(state, ["buildingCosts", "unitCosts", "totalCosts", "id"]));

  debugWeights(state);

  const plan = await buildPlan(state);

  if (plan.length == 0) {
    info("No plan to execute, exiting...");
    return;
  }

  if (!_.every(plan, (action) => action.type === "battle")) {
    info("Claiming resources..");

    await claimResources(state.id);
  }

  info("Executing plan:");

  debug(plan);

  await executePlan(state, plan);
}

function debugWeights(state: TownState) {
  const totalCost = _(state.totalCosts).values().sum();
  const totalWeights =
    _(BUILDING_WEIGHTS).map(1).sum() + _(UNIT_WEIGHTS).map(1).sum();

  debug(
    _(BUILDING_WEIGHTS)
      .map(([name]) => [
        name,
        (state.totalCosts[name] * totalWeights) / totalCost,
      ])
      .value()
  );
  debug(
    _(UNIT_WEIGHTS)
      .map(([name]) => [
        name,
        (state.totalCosts[name] * totalWeights) / totalCost,
      ])
      .value()
  );
}
