require("dotenv").config();

import { authenticate } from "./service/auth-service";
import { initProvider } from "./service/provider-service";
import {
  getAllTowns,
  getTownState,
  TownState,
  TownSummary,
} from "./service/town-service";
import { claimBuildingUpgrades } from "./service/building-service";
import _ from "lodash";
import { buildPlan, executePlan } from "./service/planner/plan-service";
import { claimResources } from "./service/resource-service";
import { claimUnitUpgrades } from "./service/unit-service";
import { TOWN_TOKEN_IDS } from "./service/config-service";
import { debug, error, info } from "./service/log-service";
import { BUILDING_WEIGHTS, UNIT_WEIGHTS } from "./service/planner/plan";

(async () => {
  info("Fetching block number...");

  await initProvider();

  info("Authenticating...");

  await authenticate();

  info("Fetching all towns...");

  const towns = await getAllTowns();

  for (const townTokenId of TOWN_TOKEN_IDS) {
    info(`Processing town ${townTokenId}`);

    try {
      await processTown(townTokenId, towns);
    } catch (ex) {
      error("Error occurred");
      debug(ex);
    }
  }

  process.exit();
})();

async function processTown(townTokenId: number, towns: TownSummary[]) {
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

  const plan = await buildPlan(state, towns);

  if (plan.length == 0) {
    info("No plan to execute, exiting...");
    return;
  }

  info("Claiming resources..");

  await claimResources(state.id);

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
