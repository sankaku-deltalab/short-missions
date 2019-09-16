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
    const horizontalNumMax = Math.max(
      spawnNum,
      Math.floor(0.95 * (1 / enemySizeInArea.y))
    );
    const verticalNumMax = Math.ceil(spawnNum / horizontalNumMax);
    const horizontalNum = Math.ceil(spawnNum / verticalNumMax);
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
          const horizontalIdx = Math.floor(count / verticalNumMax);
          const verticalIdx = count - horizontalIdx * verticalNumMax;
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
