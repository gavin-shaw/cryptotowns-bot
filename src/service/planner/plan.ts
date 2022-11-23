export const BUILDING_TARGETS: BuildingWeight[] = [
  ["TOWN_HALL", 25],
  ["WALL", 5],
  ["LUMBER", 9],
  ["FARM", 9],
  ["GOLD", 9],
  ["BARRACK", 4],
  ["STABLE", 4],
  ["HOUSING", 1],
  ["SIEGE", 1],
];

export const UNIT_TARGETS: UnitWeight[] = [
  ["KNIGHT", 20],
  ["PIKE", 10],
  ["SWORD", 1],
  ["RAIDER", 1],
  ["TREBUCHET", 1],
];

export type BuildingWeight = [string, number];

export type UnitWeight = [string, number];
