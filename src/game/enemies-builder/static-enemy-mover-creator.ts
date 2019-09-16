import { StaticEnemyMover } from "../mover/static-enemy-mover";
import { EnemyMoveRoute } from "../mover/enemy-move-route";
import { StraightMoveRoute } from "../contents/enemy-move-route/straight-move-route";
import { EventDispatcher } from "../common/event-dispatcher";
import { BasicMoveRoute } from "../contents/enemy-move-route/basic-move-route";

/**
 * Enemy move route types.
 */
export enum EnemyMoveRouteType {
  sideMove = "sideMove",
  drop = "drop"
}

export interface StaticEnemyMoverCreatorArgs {
  routeType: EnemyMoveRouteType;
  activateTime: number;
  moveSpeedInArea: number;
  isLeftSide: boolean;
}

/**
 * Create StaticEnemyMover with route.
 * Route was specified by `routeType` in arguments.
 */
export class StaticEnemyMoverCreator {
  private readonly routeType: EnemyMoveRouteType;
  private readonly activateTime: number;
  private readonly moveSpeedInArea: number;
  private readonly isLeftSide: boolean;

  public constructor(args: StaticEnemyMoverCreatorArgs) {
    this.routeType = args.routeType;
    this.activateTime = args.activateTime;
    this.moveSpeedInArea = args.moveSpeedInArea;
    this.isLeftSide = args.isLeftSide;
  }

  /**
   * Create new StaticEnemyMover.
   *
   * @param activePosInArea Route activate position.
   */
  public create(activePosInArea: ex.Vector): StaticEnemyMover {
    return new StaticEnemyMover({
      route: this.createRoute(activePosInArea),
      onEnteringToArea: new EventDispatcher<void>(),
      onExitingFromArea: new EventDispatcher<void>()
    });
  }

  private createRoute(activePosInArea: ex.Vector): EnemyMoveRoute {
    if (this.routeType === EnemyMoveRouteType.sideMove) {
      return this.createSideMoveRoute(activePosInArea);
    }
    if (this.routeType === EnemyMoveRouteType.drop) {
      return this.creteDropMoveRoute(activePosInArea);
    }
    throw new Error("Unknown route type");
  }

  private createSideMoveRoute(activePosInArea: ex.Vector): EnemyMoveRoute {
    const moveAngleDegInArea = this.isLeftSide ? 100 : -100;
    return new StraightMoveRoute({
      activePosInArea,
      moveAngleDegInArea,
      activateTime: this.activateTime,
      moveSpeedInArea: this.moveSpeedInArea
    });
  }

  private creteDropMoveRoute(activePosInArea: ex.Vector): EnemyMoveRoute {
    const enteringInterpTime = Math.min(0.1, this.activateTime);
    const enteringMove = {
      direction: Math.PI,
      speed: this.moveSpeedInArea,
      duration: enteringInterpTime
    };
    const baseMove = {
      direction: Math.PI,
      speed: this.moveSpeedInArea / 2,
      duration: 3
    };
    const exitInterpolateTime = 0.5;
    const exitingMove = {
      direction: Math.PI,
      speed: this.moveSpeedInArea / 2,
      duration: 10
    };
    return new BasicMoveRoute({
      activePosInArea,
      activateTime: this.activateTime,
      enteringMove,
      baseMove,
      exitingMove,
      exitInterpolateTime
    });
  }
}
