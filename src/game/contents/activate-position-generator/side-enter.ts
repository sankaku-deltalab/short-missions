import * as ex from "excalibur";
import {
  ActivatePositionGenerator,
  ActivateTimeAndPosition
} from "@/game/enemies-builder/activate-position-generator";

/**
 * Entering enemies from side of area.
 */
export class SideEnter implements ActivatePositionGenerator {
  public playerIsInLeftWhenEnemiesFinished(
    playerIsInLeftWhenStarted: boolean,
    _enemiesInInLeft: boolean
  ): boolean {
    return !playerIsInLeftWhenStarted;
  }

  public generate(
    spawnNum: number,
    enemyKillTimeSec: number,
    _enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[] {
    const spawnDuration =
      spawnNum > 1 ? (squadKillTimeSec - enemyKillTimeSec) / (spawnNum - 1) : 0;
    const ySign = isLeftSide ? -1 : 1;
    const posXMin = 0.23;
    const posDiff = 0.04 / spawnNum;
    return Array(spawnNum)
      .fill(0)
      .map(
        (_: number, index: number): ActivateTimeAndPosition => ({
          timeSec: spawnDuration * index,
          position: new ex.Vector(posXMin + posDiff * index, 0.35 * ySign)
        })
      );
  }
}
