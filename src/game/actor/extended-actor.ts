import * as ex from "excalibur";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { ActorWrapper } from "./actor-wrapper";
import { EventDispatcher } from "../common/event-dispatcher";

interface ExtraArgs {
  posInArea?: ex.Vector;
  sizeInArea?: ex.Vector;
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  onEnteringToArea: EventDispatcher<void>;
  onExitingFromArea: EventDispatcher<void>;
}

export interface ExtendedActorArgs extends ex.IActorArgs, ExtraArgs {}

/**
 * To avoid assign extra args (e.g. posInArea) when called super class constructor, delete posInArea from args
 *
 * @param args
 */
const removeExtraArgs = (args: ExtendedActorArgs): ex.IActorArgs => {
  const actorArgs = Object.assign({}, args);
  delete actorArgs.posInArea;
  delete actorArgs.sizeInArea;
  delete actorArgs.collisions;
  delete actorArgs.coordinatesConverter;

  return actorArgs;
};

/**
 * ExtendedActor is used for `ActorWrapper`.
 * Euclid position was represented as "in area".
 */
export class ExtendedActor extends ex.Actor {
  public readonly collisions: Collisions;
  public readonly coordinatesConverter: CoordinatesConverter;
  private _owner?: ActorWrapper;
  private readonly _onEnteringToArea: EventDispatcher<void>;
  private readonly _onExitingFromArea: EventDispatcher<void>;
  private isInVisualArea: boolean;

  public constructor(args: ExtendedActorArgs) {
    const actorArgs = removeExtraArgs(args);
    super(actorArgs);

    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;
    this._onEnteringToArea = args.onEnteringToArea;
    this._onExitingFromArea = args.onExitingFromArea;

    if (args.posInArea !== undefined) {
      this.moveToPosInArea(args.posInArea);
    }

    this.isInVisualArea = this.coordinatesConverter.canvasPointIsInVisualArea(
      this.pos
    );

    if (args.sizeInArea !== undefined) {
      const size = this.coordinatesConverter.toCanvasVector(args.sizeInArea);
      this.width = size.x;
      this.height = size.y;
    }

    this.on("postupdate", (event: ex.PostUpdateEvent): void => {
      if (this._owner !== undefined) {
        this._owner.update(event.engine, event.delta);
      }

      const oldIsInVA = this.isInVisualArea;
      this.isInVisualArea = this.coordinatesConverter.canvasPointIsInVisualArea(
        this.pos
      );

      if (!oldIsInVA && this.isInVisualArea) {
        this._onEnteringToArea.dispatch();
      } else if (oldIsInVA && !this.isInVisualArea) {
        this._onExitingFromArea.dispatch();
      }
    });
  }

  /**
   * Get `ActorWrapper` using self.
   */
  public owner(): ActorWrapper {
    if (this._owner === undefined) throw new Error("Owner was not set");
    return this._owner;
  }

  /**
   * Use self by `ActorWrapper`.
   * This function was called from ONLY `ActorWrapper` would use this.
   *
   * @param owner ActorWrapper would use this
   */
  public useSelfInWrapper(owner: ActorWrapper): void {
    if (this._owner !== undefined) throw new Error("Owner was already set");
    this._owner = owner;
  }

  /**
   * Get self position in area.
   */
  public posInArea(): ex.Vector {
    return this.coordinatesConverter.toAreaPoint(this.pos);
  }

  /**
   * Move to position in area.
   *
   * @param destInArea Destination
   */
  public moveToPosInArea(destInArea: ex.Vector): void {
    this.pos = this.coordinatesConverter.toCanvasPoint(destInArea);
  }

  /**
   * Move to position in canvas.
   *
   * @param destInCanvas Destination
   */
  public moveToPosInCanvas(destInCanvas: ex.Vector): void {
    this.pos = destInCanvas.clone();
  }

  /**
   * Get self position in visual area.
   */
  public posInVisualArea(): ex.Vector {
    return this.coordinatesConverter.toVisualAreaPoint(this.pos);
  }

  /**
   * Get world position in area.
   *
   * NOTE: When self was child of other `Actor`,
   * `posInArea()` represent relational position from parent.
   */
  public getWorldPosInArea(): ex.Vector {
    return this.coordinatesConverter.toAreaPoint(this.getWorldPos());
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

  /**
   * Set collision of self.
   *
   * @param collision
   */
  public setCollision(collision: ex.CollisionGroup): void {
    this.body.collider.group = collision;
  }
}
