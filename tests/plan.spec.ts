import "jest";
import _ from "lodash";
import { BUILDING_TARGETS, UNIT_TARGETS } from "../src/service/planner/plan";

describe("Plan", () => {
  describe("Weights", () => {
    it("should add to 100", async () => {
      const totalWeights = _(BUILDING_TARGETS)
        .union(UNIT_TARGETS)
        .tap(console.log)
        .map(1)
        .sum();
      expect(totalWeights).toEqual(100);
    });
  });
});
