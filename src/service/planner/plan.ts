export const BUILDING_UPGRADE_ORDER: BuildingGroup[] = [
  ["WALL"],
  ["TOWN_HALL"],
  ["LUMBER", "FARM", "GOLD"],
  ["BARRACK", "STABLE"],
  ["HOUSING"],
  ["SIEGE"],
];

export const UNIT_TRAIN_ORDER: TrainingGroup[] = [
  [
    ["KNIGHT", 50],
    ["PIKE", 200],
  ],
  [
    ["SWORD", 200],
    ["RAIDER", 50],
  ],
  [["TREBUCHET", 1]],
];

export type BuildingGroup = string[];

export type TrainingGroup = TrainingCap[];

export type TrainingCap = [string, number];
