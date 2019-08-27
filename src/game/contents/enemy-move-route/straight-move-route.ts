import * as ex from "excalibur";
import { EnemyMoveRoute } from "@/game/enemy-move-route";

export interface StraightMoveRouteArgs {
  activePosInArea: ex.Vector;
  activateTime: number;
  moveSpeedInArea: number;
  moveAngleDegInArea: number;
}

export class StraightMoveRoute implements EnemyMoveRoute {
  private readonly activePosInArea: ex.Vector;
  private readonly activateTime: number;
  private readonly moveSpeedInArea: number;
  private readonly moveAngleDegInArea: number;

  public constructor(args: StraightMoveRouteArgs) {
    this.activePosInArea = args.activePosInArea;
    this.activateTime = args.activateTime;
    this.moveSpeedInArea = args.moveSpeedInArea;
    this.moveAngleDegInArea = args.moveAngleDegInArea;
  }

  public calcPositionInArea(timeMS: number): ex.Vector {
    const velocityInArea = this.calcVelocityInArea();
    const startInArea = this.getInitialPosition();
    return startInArea.add(velocityInArea.scale(timeMS / 1000));
  }

  public getInitialPosition(): ex.Vector {
    const velocityInArea = this.calcVelocityInArea();
    return velocityInArea.scale(-this.activateTime).add(this.activePosInArea);
  }

  private calcVelocityInArea(): ex.Vector {
    const angleRad = -this.moveAngleDegInArea * (Math.PI / 180);
    const moveDir = ex.Vector.fromAngle(angleRad);
    return moveDir.scale(this.moveSpeedInArea);
  }
}
