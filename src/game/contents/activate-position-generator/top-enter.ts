import * as ex from "excalibur";
import {
  ActivatePositionGenerator,
  ActivateTimeAndPosition
} from "@/game/enemies-builder/activate-position-generator";

/**
 * Entering enemies from top of left or right.
 */
export class TopEnter implements ActivatePositionGenerator {
  public playerIsInLeftWhenEnemiesFinished(
    _playerIsInLeftWhenStarted: boolean,
    enemiesInInLeft: boolean
  ): boolean {
    return enemiesInInLeft;
  }

  public generate(
    spawnNum: number,
    enemyKillTimeSec: number,
    enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[] {
    const spawnableYStart = enemySizeInArea.y / 2;
    const spawnableYEnd = 3 / 8 - enemySizeInArea.y / 2;
    const spawnableWidth = spawnableYEnd - spawnableYStart;
    const horizontalNumMax = Math.max(1, spawnableWidth / enemySizeInArea.y);
    const horizontalNum = Math.min(spawnNum, horizontalNumMax);
    const verticalNumMax = Math.ceil(spawnNum / horizontalNum);
    const spawnDuration =
      spawnNum > 1 ? (squadKillTimeSec - enemyKillTimeSec) / (spawnNum - 1) : 0;
    const ySign = isLeftSide ? -1 : 1;
    const posXMin = 0.3;
    const posXDiff = 0.2 / verticalNumMax;
    const posYList = new Array(horizontalNum)
      .fill(0)
      .map((_, index): number => {
        const unit = 3 / 8 / (horizontalNum + 1);
        return unit * (index + 1);
      });
    return Array(spawnNum)
      .fill(0)
      .map(
        (_: number, count: number): ActivateTimeAndPosition => {
          const verticalIdx = Math.floor(count / horizontalNum);
          const horizontalIdx = count - verticalIdx * horizontalNum;
          const posY = posYList[horizontalIdx];
          const position = new ex.Vector(
            posXMin + verticalIdx * posXDiff,
            ySign * posY
          );
          return {
            timeSec: spawnDuration * count,
            position
          };
        }
      );
  }
}
