import * as ex from "excalibur";
import {
  ActivatePositionGenerator,
  ActivateTimeAndPosition
} from "@/game/enemies-builder/activate-position-generator";

/**
 * Entering enemies from top of left or right.
 */
export class TopEnter implements ActivatePositionGenerator {
  public generate(
    spawnNum: number,
    enemyKillTimeSec: number,
    enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[] {
    const horizontalNumMax = Math.max(
      1,
      Math.floor(0.9 * (0.5 / enemySizeInArea.y))
    );
    const horizontalNum = Math.min(spawnNum, horizontalNumMax);
    const verticalNumMax = Math.ceil(spawnNum / horizontalNum);
    const spawnDuration =
      spawnNum > 1 ? (squadKillTimeSec - enemyKillTimeSec) / (spawnNum - 1) : 0;
    const ySign = isLeftSide ? -1 : 1;
    const posXMin = 0.2;
    const posXDiff = 0.2 / verticalNumMax;
    const posYMin = Math.min(0.25, 0.25 / horizontalNum);
    const posYDiff = 0.5 / horizontalNum;
    return Array(spawnNum)
      .fill(0)
      .map(
        (_: number, count: number): ActivateTimeAndPosition => {
          const verticalIdx = Math.floor(count / horizontalNum);
          const horizontalIdx = count - verticalIdx * horizontalNum;
          const position = new ex.Vector(
            posXMin + verticalIdx * posXDiff,
            ySign * (posYMin + horizontalIdx * posYDiff)
          );
          return {
            timeSec: spawnDuration * count,
            position
          };
        }
      );
  }
}
