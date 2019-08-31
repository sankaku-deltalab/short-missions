import { StaticEnemyMover } from "./static-enemy-mover";

export interface StaticEnemyMoverCreatorArgs {
  // TODO: Add route enum
  activateTime: number;
  moveSpeedInArea: number;
  moveAngleDegInArea: number;
}

export class StaticEnemyMoverCreator {
  private readonly activateTime: number;
  private readonly moveSpeedInArea: number;
  private readonly moveAngleDegInArea: number;

  public constructor(args: StaticEnemyMoverCreatorArgs) {
    this.activateTime = args.activateTime;
    this.moveSpeedInArea = args.moveSpeedInArea;
    this.moveAngleDegInArea = args.moveAngleDegInArea;
  }

  public create(_activePosInArea: ex.Vector): StaticEnemyMover {
    throw new Error("Implement this."); // TODO: Implement this
  }
}
