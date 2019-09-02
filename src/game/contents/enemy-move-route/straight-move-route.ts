import * as ex from "excalibur";
import { EnemyMoveRoute } from "@/game/enemy-move-route";

export interface StraightMoveRouteArgs {
  activePosInArea: ex.Vector;
  activateTime: number;
  moveSpeedInArea: number;
  moveAngleDegInArea: number;
}

/**
 * Move straight
 */
export class StraightMoveRoute implements EnemyMoveRoute {
  /** Activate position */
  private readonly activePosInArea: ex.Vector;
  /** Activating time */
  private readonly activateTime: number;
  /** Move speed. When speed is 1.0, through area vertically in 1.0 seconds. */
  private readonly moveSpeedInArea: number;
  /** Move direction angle. Clockwise and top is 0 degrees. */
  private readonly moveAngleDegInArea: number;

  /**
   *
   * @param args Arguments
   */
  public constructor(args: StraightMoveRouteArgs) {
    this.activePosInArea = args.activePosInArea;
    this.activateTime = args.activateTime;
    this.moveSpeedInArea = args.moveSpeedInArea;
    this.moveAngleDegInArea = args.moveAngleDegInArea;
  }

  /**
   * Calc position in moving.
   *
   * @param timeMS Time since start in milliseconds.
   */
  public calcPositionInArea(timeMS: number): ex.Vector {
    const velocityInArea = this.calcVelocityInArea();
    const startInArea = this.getInitialPosition();
    return startInArea.add(velocityInArea.scale(timeMS / 1000));
  }

  /**
   * Get initial position.
   */
  public getInitialPosition(): ex.Vector {
    const velocityInArea = this.calcVelocityInArea();
    return velocityInArea.scale(-this.activateTime).add(this.activePosInArea);
  }

  private calcVelocityInArea(): ex.Vector {
    const angleRad = this.moveAngleDegInArea * (Math.PI / 180);
    const moveDir = ex.Vector.fromAngle(angleRad);
    return moveDir.scale(this.moveSpeedInArea);
  }
}
