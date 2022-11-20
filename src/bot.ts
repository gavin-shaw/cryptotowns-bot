require("dotenv").config();

import { authenticate } from "./service/auth-service";
import { initProvider } from "./service/provider-service";
import { getTownState } from "./service/town-service";
import { claimBuildingUpgrades } from "./service/building-service";
import _ from "lodash";
import { buildPlan, executePlan } from "./service/plan-service";
import { claimResources } from "./service/resource-service";
import { claimUnitUpgrades } from "./service/unit-service";

(async () => {
  await initProvider();

  const townTokenId = Number(process.env.TOWN_TOKEN_ID!);

  console.log("Authenticating...");
  await authenticate();

  console.log("Getting town state...");
  let state = await getTownState(townTokenId);

  let stateStale = false;

  if (Object.keys(state.unclaimed.buildings).length > 0) {
    console.log("Claiming buildings...");
    await claimBuildingUpgrades(state.id);
    stateStale = true;
  }

  if (Object.keys(state.unclaimed.units).length > 0) {
    console.log("Claiming units...");
    await claimUnitUpgrades(state.id);
    stateStale = true;
  }

  if (stateStale) {
    console.log("Getting town state...");
    state = await getTownState(townTokenId);
  }

  const plan = buildPlan(state);

  if (plan.length == 0) {
    console.log("No plan to execute, exiting...");
    process.exit()
  }

  console.log("Executing plan:");
  console.log(plan);

  await claimResources(state.id);

  await executePlan(state, plan);
})();
