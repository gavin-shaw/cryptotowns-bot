import { authenticate } from "./service/auth-service";
import { initProvider } from "./service/provider-service";
import { getTownState } from "./service/town-service";
import { upgradeBuilding } from "./service/upgrade-service";

const TOWN_ID = 116;

(async () => {
  require("dotenv").config();

  await initProvider();

  const state = await getTownState(116);

  console.log(state);

  return;
  const token = await authenticate();

  const upgradeResponse = await upgradeBuilding("BARRACK", 10, token);

  console.log(upgradeResponse);
})();
