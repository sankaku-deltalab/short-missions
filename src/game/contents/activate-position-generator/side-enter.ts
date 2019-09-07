import * as ex from "excalibur";
import { ActivatePositionGenerator } from "@/game/enemies-builder/activate-position-generator";

export interface ActivateTimeAndPosition {
  timeSec: number;
  position: ex.Vector;
}

/**
 * Entering enemies from side of area.
 */
export class SideEnter implements ActivatePositionGenerator {
  public generate(
    enemyKillTimeSec: number,
    _enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[] {
    const ek = Math.max(1 / 8, enemyKillTimeSec);
    const spawnNum = Math.max(1, Math.floor(squadKillTimeSec / ek));
    const spawnDuration =
      spawnNum > 1 ? (squadKillTimeSec - ek) / (spawnNum - 1) : 0;
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
