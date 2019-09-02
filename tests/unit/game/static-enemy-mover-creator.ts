import * as ex from "excalibur";
import {
  EnemyMoveRouteType,
  StaticEnemyMoverCreator
} from "@/game/static-enemy-mover-creator";
import { StaticEnemyMover } from "@/game/static-enemy-mover";

describe("StaticEnemyMoverCreator", (): void => {
  it("create StaticEnemyMover", (): void => {
    // Given StaticEnemyMoverCreator
    const args = {
      routeType: EnemyMoveRouteType.sideMove,
      activateTime: 1,
      moveSpeedInArea: 1,
      isLeftSide: true
    };
    const creator = new StaticEnemyMoverCreator(args);

    // When construct StaticEnemyMover
    const created = creator.create(new ex.Vector(0.25, 0.25));

    // Then created is StaticEnemyMover
    expect(created).toBeInstanceOf(StaticEnemyMover);
  });
});
