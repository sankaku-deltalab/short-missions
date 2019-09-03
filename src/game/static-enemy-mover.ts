import { EventDispatcher } from "./event-dispatcher";
import { EnemyMoveRoute } from "./enemy-move-route";
import { Mover } from "./mover";
import { ActorWrapper } from "./actor-wrapper";

export interface StaticEnemyMoverArgs {
  route: EnemyMoveRoute;
  onEnteringToArea: EventDispatcher<void>;
  onExitingFromArea: EventDispatcher<void>;
}

/**
 * Move enemy with static route.
 */
export class StaticEnemyMover implements Mover {
  /** Dispatch when owner entered to area. */
  public readonly onEnteringToArea: EventDispatcher<void>;

  /** Dispatch when owner exiting from area. */
  public readonly onExitingFromArea: EventDispatcher<void>;

  private playedTimeMS = 0;
  private owner?: ActorWrapper;
  private route: EnemyMoveRoute;
  private alreadyEnteredToArea = false;
  private alreadyExitingFromArea = false;
  private ownerIsInVisualArea = false;

  public constructor(args: StaticEnemyMoverArgs) {
    this.route = args.route;
    this.onEnteringToArea = args.onEnteringToArea;
    this.onExitingFromArea = args.onExitingFromArea;
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public start(owner: ActorWrapper): void {
    this.owner = owner;
    this.playedTimeMS = 0;
    this.owner.actor.posInArea = this.route.getInitialPosition();
    this.updateOwnerIsInVisualArea();
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public update(deltaTimeMS: number): void {
    if (this.owner === undefined) throw new Error("This is not started yet");

    const ownerIsInVisualAreaBeforeMove = this.ownerIsInVisualArea;

    this.playedTimeMS += deltaTimeMS;
    this.owner.actor.posInArea = this.route.calcPositionInArea(
      this.playedTimeMS
    );

    this.updateOwnerIsInVisualArea();
    const ownerIsInVisualAreaAfterMove = this.ownerIsInVisualArea;

    if (!ownerIsInVisualAreaBeforeMove && ownerIsInVisualAreaAfterMove) {
      this.enter();
    } else if (ownerIsInVisualAreaBeforeMove && !ownerIsInVisualAreaAfterMove) {
      this.exit();
    }
  }

  private enter(): void {
    if (this.alreadyEnteredToArea) return;
    this.onEnteringToArea.dispatch();
  }

  private exit(): void {
    if (this.alreadyExitingFromArea) return;
    this.onExitingFromArea.dispatch();
  }

  private updateOwnerIsInVisualArea(): void {
    if (this.owner === undefined) throw new Error("Owner is not set");
    const cc = this.owner.actor.coordinatesConverter;
    this.ownerIsInVisualArea = cc.canvasPointIsInVisualArea(
      this.owner.actor.pos
    );
  }
}
