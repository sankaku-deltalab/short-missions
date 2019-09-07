import * as ex from "excalibur";

export interface EnemyMoveRoute {
  calcPositionInArea(timeMS: number): ex.Vector;
  getInitialPosition(): ex.Vector;
}
