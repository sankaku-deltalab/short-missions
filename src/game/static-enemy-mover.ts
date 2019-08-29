import { EventDispatcher } from "./event-dispatcher";
import { EnemyMoveRoute } from "./enemy-move-route";
import { Mover } from "./mover";
import { ActorWrapper } from "./actor-wrapper";

export interface StaticEnemyMoverArgs {
  route: EnemyMoveRoute;
  onEnteredToArea: EventDispatcher<void>;
  onExitingFromArea: EventDispatcher<void>;
}

export class StaticEnemyMover implements Mover {
  public readonly onEnteredToArea: EventDispatcher<void>;
  public readonly onExitingFromArea: EventDispatcher<void>;
  private playedTimeMS: number = 0;
  private owner?: ActorWrapper;
  private route: EnemyMoveRoute;
  private alreadyEnteredToArea: boolean = false;
  private alreadyExitingFromArea: boolean = false;
  private ownerIsInVisualArea: boolean = false;

  public constructor(args: StaticEnemyMoverArgs) {
    this.route = args.route;
    this.onEnteredToArea = args.onEnteredToArea;
    this.onExitingFromArea = args.onExitingFromArea;
  }

  public start(owner: ActorWrapper): void {
    this.owner = owner;
    this.playedTimeMS = 0;
    this.owner.actor.posInArea = this.route.getInitialPosition();
    this.updateOwnerIsInVisualArea();
  }

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
    this.onEnteredToArea.dispatch();
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
