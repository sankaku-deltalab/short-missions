import * as ex from "excalibur";
import {
  ActivatePositionGenerator,
  ActivateTimeAndPosition
} from "@/game/enemies-builder/activate-position-generator";

/**
 * Entering enemies from top of area.
 */
export class TopWideEnter implements ActivatePositionGenerator {
  public generate(
    spawnNum: number,
    enemyKillTimeSec: number,
    enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[] {
    const spawnableYStart = 3 / 8 - enemySizeInArea.y / 2;
    const spawnableYEnd = -spawnableYStart;
    const spawnableWidth = Math.abs(spawnableYEnd - spawnableYStart);
    const horizontalNumMax = Math.max(1, spawnableWidth / enemySizeInArea.y);
    const horizontalNum = Math.min(spawnNum, horizontalNumMax);
    const spawnDuration =
      spawnNum > 1 ? (squadKillTimeSec - enemyKillTimeSec) / (spawnNum - 1) : 0;
    const ySign = isLeftSide ? -1 : 1;
    const posXList = new Array(horizontalNum)
      .fill(0)
      .map((_, index): number => {
        const posXStart = 0.3;
        const posXStop = 0.5;
        const rate = index / horizontalNum;
        return rate * posXStop + (1 - rate) * posXStart;
      });
    const posYList = new Array(horizontalNum)
      .fill(0)
      .map((_, index): number => {
        const posYStart = spawnableYStart;
        const posYStop = spawnableYEnd;
        const rate = index / horizontalNum;
        return rate * posYStop + (1 - rate) * posYStart;
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
