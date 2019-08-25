import { EventDispatcher } from "./event-dispatcher";
import { Character } from "./character";
import { EnemyMoveRoute } from "./enemy-move-route";

export interface StaticEnemyMoverArgs {
  route: EnemyMoveRoute;
  onEnteredToArea: EventDispatcher<void>;
  onExitingFromArea: EventDispatcher<void>;
}

export class StaticEnemyMover {
  public readonly onEnteredToArea: EventDispatcher<void>;
  public readonly onExitingFromArea: EventDispatcher<void>;
  private playedTimeMS: number = 0;
  private ownerInner?: Character;
  private route: EnemyMoveRoute;
  private alreadyEnteredToArea: boolean = false;
  private alreadyExitingFromArea: boolean = false;
  private ownerInVisualArea: boolean = false;

  public constructor(args: StaticEnemyMoverArgs) {
    this.route = args.route;
    this.onEnteredToArea = args.onEnteredToArea;
    this.onExitingFromArea = args.onExitingFromArea;
  }

  public set owner(character: Character) {
    if (this.ownerInner !== undefined) throw new Error("Already set owner");
    this.ownerInner = character;
  }

  public start(): void {
    if (this.ownerInner === undefined) throw new Error("Owner is not set");
    this.playedTimeMS = 0;
    this.ownerInner.actor.posInArea = this.route.getInitialPosition();
    this.updateOwnerInVisualArea();
  }

  public update(deltaTimeMS: number): void {
    if (this.ownerInner === undefined) throw new Error("Owner is not set");

    const ownerIsInVisualAreaBeforeMove = this.ownerInVisualArea;

    this.playedTimeMS += deltaTimeMS;
    this.ownerInner.actor.posInArea = this.route.calcPositionInArea(
      this.playedTimeMS
    );

    this.updateOwnerInVisualArea();
    const ownerIsInVisualAreaAfterMove = this.ownerInVisualArea;

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

  private updateOwnerInVisualArea(): void {
    if (this.ownerInner === undefined) throw new Error("Owner is not set");
    const cc = this.ownerInner.actor.coordinatesConverter;
    this.ownerInVisualArea = cc.canvasPointIsInVisualArea(
      this.ownerInner.actor.pos
    );
  }
}
