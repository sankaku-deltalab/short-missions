import { StaticEnemyMover } from "./static-enemy-mover";
import { EnemyMoveRoute } from "./enemy-move-route";
import { StraightMoveRoute } from "./contents/enemy-move-route/straight-move-route";
import { EventDispatcher } from "./event-dispatcher";

/**
 * Enemy move route types.
 */
export enum EnemyMoveRouteType {
  sideMove = "sideMove"
  // TODO: Add new types later
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
    // TODO: Add new types later
    throw new Error("Unknown route type");
  }

  private createSideMoveRoute(activePosInArea: ex.Vector): EnemyMoveRoute {
    const moveAngleDegInArea = this.isLeftSide ? -10 : -170;
    return new StraightMoveRoute({
      activePosInArea,
      moveAngleDegInArea,
      activateTime: this.activateTime,
      moveSpeedInArea: this.moveSpeedInArea
    });
  }
}
