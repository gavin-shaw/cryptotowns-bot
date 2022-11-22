export const BUILDING_WEIGHTS: BuildingWeight[] = [
  ["TOWN_HALL", 8],
  ["WALL", 4],
  ["LUMBER", 4],
  ["FARM", 4],
  ["GOLD", 4],
  ["BARRACK", 2],
  ["STABLE", 2],
  ["HOUSING", 1],
  ["SIEGE", 1],
];

export const UNIT_WEIGHTS: UnitWeight[] = [
  ["KNIGHT", 2],
  ["PIKE", 2],
  ["SWORD", 1],
  ["RAIDER", 1],
  ["TREBUCHET", 1],
];

export type BuildingWeight = [string, number];

export type UnitWeight = [string, number];
