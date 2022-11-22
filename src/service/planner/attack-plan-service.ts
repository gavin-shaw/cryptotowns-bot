import _ from "lodash";
import { query } from "../graphql-service";
import { TARGET_TOWNS_QUERY } from "../queries/towns-query";
import { TownState } from "../town-service";
import { Plan } from "./plan-service";

export async function addAttackActions(state: TownState, plan: Plan) {
  const targetTowns = await getTargetTowns(state);

  const targetTown = _(targetTowns).maxBy((town) =>
    _(town.resources).values().sum()
  );

  if (!!targetTown) {
    plan.push({
      type: "battle",
      params: [
        targetTown.id,
        targetTown.tokenId,
        _(targetTown.resources).values().sum(),
        calculateDistance(targetTown.tokenId, state.tokenId),
      ],
    });
  }
}

export async function getTargetTowns(state: TownState): Promise<TargetTown[]> {
  const { town: towns } = await query(TARGET_TOWNS_QUERY, {
    maxWallTier: 2,
    maxPikeCount: 0,
    maxKnightCount: 0,
    maxHp: 1000000,
    minResources: 0,
  });

  return _(towns)
    .filter((town) => town.buildings.length == 0 && town.units.length == 0)
    .map((town) => ({
      id: town.id,
      tokenId: town.token_id,
      hp: town.hp,
      resources: town.resource,
      distance: calculateDistance(town.token_id, state.tokenId),
    }))
    .value();
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

export interface TargetTown {
  readonly id: string;
  readonly tokenId: number;
  readonly hp: number;
  readonly resources: Record<string, number>;
  readonly distance: number;
}
