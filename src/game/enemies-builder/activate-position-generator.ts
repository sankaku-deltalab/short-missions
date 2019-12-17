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
   * Get player side when self enemies was finished.
   *
   * @param playerIsInLeftWhenStarted
   * @param enemiesInInLeft
   */
  playerIsInLeftWhenEnemiesFinished(
    playerIsInLeftWhenStarted: boolean,
    enemiesInInLeft: boolean
  ): boolean;

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
