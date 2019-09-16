import * as ex from "excalibur";

export interface ActivateTimeAndPosition {
  timeSec: number;
  position: ex.Vector;
}

/**
 * Generate enemy activate position and time.
 */
export interface ActivatePositionGenerator {
  /**
   * Generate enemy activate position and time.
   *
   * @param spawnNum
   * @param enemyKillTimeSec
   * @param enemySizeInArea
   * @param squadKillTimeSec
   * @param isLeftSide
   */
  generate(
    spawnNum: number,
    enemyKillTimeSec: number,
    enemySizeInArea: ex.Vector,
    squadKillTimeSec: number,
    isLeftSide: boolean
  ): ActivateTimeAndPosition[];
}
