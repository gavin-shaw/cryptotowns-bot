require("dotenv").config();

import _ from "lodash";
import { TOWN_TOKEN_IDS } from "./config";
import { authenticate } from "./service/auth-service";
import { claimBuildingUpgrades } from "./service/building-service";
import { debug, error, info } from "./service/log-service";
import { BUILDING_TARGETS, UNIT_TARGETS } from "./service/planner/plan";
import { affordable, buildPlan, executePlan } from "./service/planner/plan-service";
import { blockNumber, initProvider } from "./service/provider-service";
import { claimResources } from "./service/resource-service";
import { getTownState, TownState } from "./service/town-service";
import { claimUnitUpgrades } from "./service/unit-service";

(async () => {
  info("Fetching block number...");

  await initProvider();

  info(`Block number: ${blockNumber}`);

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

  debugWeights(state);

  // info("Town state:");

  // debug(_.omit(state, ["buildingCosts", "unitCosts", "totalCosts", "id"]));

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

  debug("Plan vs Targets");

  const balance = _(state.resources)
    .mapValues((value, key) => value + state.unclaimed.resources[key])
    .value()

  debug(
    _(BUILDING_TARGETS)
      .union(UNIT_TARGETS)
      .map(([name, target]) => {
        const actual = Number(
          ((state.totalCosts[name] * 100) / totalCost).toFixed(1)
        );

        let cost = state.unitCosts[name];
        if (!cost) {
          cost = state.buildingCosts[name]
        }

        return [
          name,
          target - actual > 0 ? "x" : "✓",
          actual,
          target,
          !affordable(balance,cost) ? "x" : "✓",          
        ];
      })
      .value()
  );
}
