require("dotenv").config();

import { authenticate } from "./service/auth-service";
import { initProvider } from "./service/provider-service";
import { getTownState } from "./service/town-service";
import { claimBuildingUpgrades } from "./service/building-service";
import _ from "lodash";
import { buildPlan, executePlan } from "./service/planner/plan-service";
import { claimResources } from "./service/resource-service";
import { claimUnitUpgrades } from "./service/unit-service";
import { TOWN_TOKEN_IDS } from "./service/config-service";
import { debug, error, info } from "./service/log-service";

(async () => {
  info("Fetching block number...");

  await initProvider();

  info("Authenticating...");

  await authenticate();

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

  debug(_.omit(state, ["buildingCosts", "id"]));

  const plan = buildPlan(state);

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
