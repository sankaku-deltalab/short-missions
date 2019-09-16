import * as ex from "excalibur";
import { EnemyMoveRoute } from "@/game/mover/enemy-move-route";

interface Moving {
  direction: number;
  speed: number;
  duration: number;
}

export interface BasicMoveRouteArgs {
  activePosInArea: ex.Vector;
  activateTime: number;
  enteringMove: Moving;
  baseMove: Moving;
  exitingMove: Moving;
  exitInterpolateTime: number;
}

export class BasicMoveRoute implements EnemyMoveRoute {
  private readonly activePosInArea: ex.Vector;
  private readonly activateTime: number;
  private readonly enteringMove: Moving;
  private readonly baseMove: Moving;
  private readonly exitingMove: Moving;
  private readonly exitInterpolateTime: number;

  public constructor(args: BasicMoveRouteArgs) {
    this.activePosInArea = args.activePosInArea;
    this.activateTime = args.activateTime;
    this.enteringMove = args.enteringMove;
    this.baseMove = args.baseMove;
    this.exitingMove = args.exitingMove;
    this.exitInterpolateTime = args.exitInterpolateTime;
  }

  /**
   * Calc position in moving.
   *
   * @param timeMS Time since start in milliseconds.
   */
  public calcPositionInArea(timeMS: number): ex.Vector {
    const time = timeMS / 1000;
    const enteredTime = this.enteringMove.duration;
    const enteringInterpolatedTime = this.activateTime;
    const baseMovedTime = enteringInterpolatedTime + this.baseMove.duration;
    const exitingInterpolatedTime = baseMovedTime + this.exitInterpolateTime;

    const initialPos = this.getInitialPosition();
    const enteredPos = initialPos.add(
      this.calcMovingVectorInArea(this.enteringMove)
    );
    const baseMovedPos = this.activePosInArea.add(
      this.calcMovingVectorInArea(this.baseMove)
    );
    const exitStartPos = baseMovedPos.add(
      this.calcInterpolateMovingVectorInArea(
        this.baseMove,
        this.exitingMove,
        this.exitInterpolateTime
      )
    );

    const enterVel = this.calcMovingVelocityInArea(this.enteringMove);
    const baseVel = this.calcMovingVelocityInArea(this.baseMove);
    const exitVel = this.calcMovingVelocityInArea(this.exitingMove);

    if (time < enteredTime) {
      // Initial entering
      return initialPos.add(enterVel.scale(time));
    } else if (time < enteringInterpolatedTime) {
      // Interpolating initial to base
      const duration = time - enteredTime;
      const interpTime = this.calcEnteringInterpolateTime();
      const accel = baseVel.sub(enterVel).scale(1 / interpTime);
      // x = x_0 + v_0^2 + 1/2 * a * t^2
      const movedInInterp = enterVel
        .scale(enterVel)
        .add(accel.scale(duration ** 2 / 2));
      return enteredPos.add(movedInInterp);
    } else if (time < baseMovedTime) {
      // Base move
      const duration = time - this.activateTime;
      return this.activePosInArea.add(baseVel.scale(duration));
    } else if (time < exitingInterpolatedTime) {
      // Interpolating base to exiting
      const duration = time - baseMovedTime;
      const interpTime = this.exitInterpolateTime;
      const accel = exitVel.sub(baseVel).scale(1 / interpTime);
      // x = x_0 + v_0^2 + 1/2 * a * t^2
      const movedInInterp = baseVel
        .scale(baseVel)
        .add(accel.scale(duration ** 2 / 2));
      return baseMovedPos.add(movedInInterp);
    } else {
      // Exit move
      const duration = time - exitingInterpolatedTime;
      return exitStartPos.add(exitVel.scale(duration));
    }
  }

  /**
   * Get initial position.
   */
  public getInitialPosition(): ex.Vector {
    const enteringMoved = this.calcMovingVectorInArea(this.enteringMove);
    const interpolateMoved = this.calcInterpolateMovingVectorInArea(
      this.enteringMove,
      this.baseMove,
      this.calcEnteringInterpolateTime()
    );
    const movedBeforeActivated = enteringMoved.add(interpolateMoved);
    return this.activePosInArea.sub(movedBeforeActivated);
  }

  private calcEnteringInterpolateTime(): number {
    return this.activateTime - this.enteringMove.duration;
  }

  private calcInterpolateMovingVectorInArea(
    firstMoving: Moving,
    nextMoving: Moving,
    duration: number
  ): ex.Vector {
    const firstVelocity = this.calcMovingVelocityInArea(firstMoving);
    const nextVelocity = this.calcMovingVelocityInArea(nextMoving);
    return firstVelocity
      .add(nextVelocity)
      .scale(1 / 2)
      .scale(duration);
  }

  private calcMovingVectorInArea(moving: Moving): ex.Vector {
    return this.calcMovingVelocityInArea(moving).scale(moving.duration);
  }

  private calcMovingVelocityInArea(moving: Moving): ex.Vector {
    return ex.Vector.fromAngle(moving.direction - Math.PI).scale(moving.speed);
  }
}
