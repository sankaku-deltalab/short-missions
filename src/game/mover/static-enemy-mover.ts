import { EventDispatcher } from "../common/event-dispatcher";
import { EnemyMoveRoute } from "./enemy-move-route";
import { Mover } from "./mover";
import { ActorWrapper } from "../actor/actor-wrapper";

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
  private readonly _onEnteringToArea: EventDispatcher<void>;

  /** Dispatch when owner exiting from area. */
  private readonly _onExitingFromArea: EventDispatcher<void>;

  private playedTimeMS = 0;
  private owner?: ActorWrapper;
  private route: EnemyMoveRoute;
  private alreadyEnteredToArea = false;
  private alreadyExitingFromArea = false;
  private ownerIsInVisualArea = false;

  public constructor(args: StaticEnemyMoverArgs) {
    this.route = args.route;
    this._onEnteringToArea = args.onEnteringToArea;
    this._onExitingFromArea = args.onExitingFromArea;
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public start(owner: ActorWrapper): void {
    this.owner = owner;
    this.playedTimeMS = 0;
    this.ownerIsInVisualArea = false;
    this.alreadyEnteredToArea = false;
    this.alreadyExitingFromArea = false;
    this.owner.actor.moveToPosInArea(this.route.getInitialPosition());
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
    this.owner.actor.moveToPosInArea(
      this.route.calcPositionInArea(this.playedTimeMS)
    );

    this.updateOwnerIsInVisualArea();
    const ownerIsInVisualAreaAfterMove = this.ownerIsInVisualArea;

    if (!ownerIsInVisualAreaBeforeMove && ownerIsInVisualAreaAfterMove) {
      this.enter();
    } else if (ownerIsInVisualAreaBeforeMove && !ownerIsInVisualAreaAfterMove) {
      this.exit();
    }
  }

  /**
   * Add event called when entering to area.
   *
   * @param event
   * @returns Event remover
   */
  public onEnteringToArea(event: () => void): () => void {
    return this._onEnteringToArea.add(event);
  }

  /**
   * Add event called when exiting from area.
   *
   * @param event
   * @returns Event remover
   */
  public onExitingFromArea(event: () => void): () => void {
    return this._onExitingFromArea.add(event);
  }

  private enter(): void {
    if (this.alreadyEnteredToArea) return;
    this._onEnteringToArea.dispatch();
  }

  private exit(): void {
    if (this.alreadyExitingFromArea) return;
    this._onExitingFromArea.dispatch();
  }

  private updateOwnerIsInVisualArea(): void {
    if (this.owner === undefined) throw new Error("Owner is not set");
    const cc = this.owner.actor.coordinatesConverter;
    this.ownerIsInVisualArea = cc.canvasPointIsInVisualArea(
      this.owner.actor.pos
    );
  }
}
