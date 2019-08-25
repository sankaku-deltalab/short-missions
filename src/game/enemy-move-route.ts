import * as ex from "excalibur";

export interface EnemyMoveRoute {
  calcPositionInArea(deltaTimeMS: number): ex.Vector;
  getInitialPosition(): ex.Vector;
}
