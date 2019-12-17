import * as ex from "excalibur";
import {
  ActivatePositionGenerator,
  ActivateTimeAndPosition
} from "@/game/enemies-builder/activate-position-generator";

/**
 * Entering enemies from top of area.
 */
export class TopWideEnter implements ActivatePositionGenerator {
  public playerIsInLeftWhenEnemiesFinished(
    _playerIsInLeftWhenStarted: boolean,
    enemiesInInLeft: boolean
  ): boolean {
    return !enemiesInInLeft;
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
    const posXList = new Array(spawnNum).fill(0).map((_, index): number => {
      const posXStart = 0.3;
      const posXStop = 0.3;
      const rate = index / spawnNum;
      return rate * posXStop + (1 - rate) * posXStart;
    });
    const posYList = new Array(spawnNum).fill(0).map((_, index): number => {
      const unit = 3 / 4 / (spawnNum + 1);
      const rightMost = 3 / 8;
      return rightMost - unit * (index + 1);
    });
    return Array(spawnNum)
      .fill(0)
      .map(
        (_: number, count: number): ActivateTimeAndPosition => {
          const posX = posXList[count];
          const posY = posYList[count];
          const position = new ex.Vector(posX, ySign * posY);
          return {
            timeSec: spawnDuration * count,
            position
          };
        }
      );
  }
}
