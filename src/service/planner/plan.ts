export const BUILDING_WEIGHTS: BuildingWeight[] = [
  ["WALL", 4],
  ["TOWN_HALL", 4],
  ["LUMBER", 4],
  ["FARM", 4],
  ["GOLD", 4],
  ["BARRACK", 2],
  ["STABLE", 2],
  ["HOUSING", 1],
  ["SIEGE", 1],
];

export const UNIT_WEIGHTS: UnitWeight[] = [
  ["KNIGHT", 4],
  ["PIKE", 4],
  ["SWORD", 2],
  ["RAIDER", 2],
  ["TREBUCHET", 1],
];

export type BuildingWeight = [string, number];

export type UnitWeight = [string, number];
