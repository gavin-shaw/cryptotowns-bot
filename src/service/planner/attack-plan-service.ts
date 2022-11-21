import _ from "lodash";
import { getAllTowns, TownState, TownSummary } from "../town-service";
import { Plan } from "./plan-service";

export async function addAttackActions(state: TownState, plan: Plan, towns: TownSummary[]) {

  const defTown = _(towns)
    .filter(
      (town) =>
        town.hp <= 6000 &&
        _(town.resources).values().sum() > 3000 &&
        town.buildings["WALL"] <= 2 &&
        (town.units["PIKE"] ?? 0) == 0 &&
        (town.units["KNIGHT"] ?? 0) == 0
    )
    .sortBy((town) => calculateDistance(town.tokenId, state.token_id))
    .first();

  if (!!defTown) {
    plan.push({
      type: "battle",
      params: [defTown.id, defTown.tokenId, _(defTown.resources).values().sum(), calculateDistance(defTown.tokenId, state.token_id)],
    });
  }
}

function calculateDistance(defTownTokenId: number, atkTownTokenId: number) {
  const defLocation = getLocation(defTownTokenId);
  const atkLocation = getLocation(atkTownTokenId);

  return Math.floor(
    Math.sqrt(
      Math.pow(defLocation[0] - atkLocation[0], 2) +
        Math.pow(defLocation[1] - atkLocation[1], 2)
    )
  );
}

function getLocation(token_id: number): [number, number] {
  const e = token_id + 1;
  const n = Math.ceil((Math.sqrt(e) - 1) / 2);
  const r = 2 * n + 1;
  let o = r ** 2;
  const i = r - 1;
  return e >= o - i
    ? [n - (o - e), -n]
    : ((o -= i),
      e >= o - i
        ? [-n, -n + (o - e)]
        : ((o -= i), e >= o - i ? [-n + (o - e), n] : [n, n - (o - e - i)]));
}
