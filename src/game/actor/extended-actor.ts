import * as ex from "excalibur";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { ActorWrapper } from "./actor-wrapper";

export interface ExtendedActorArgs extends ex.IActorArgs {
  posInArea?: ex.Vector;
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
}

/**
 * ExtendedActor is used for `ActorWrapper`.
 * Euclid position was represented as "in area".
 */
export class ExtendedActor extends ex.Actor {
  public readonly collisions: Collisions;
  public readonly coordinatesConverter: CoordinatesConverter;
  private _owner?: ActorWrapper;

  public constructor(args: ExtendedActorArgs) {
    // to avoid assign posInArea when called super class constructor, delete posInArea from args
    const posInArea = args.posInArea;
    delete args.posInArea;

    super(args);
    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;

    if (posInArea !== undefined) {
      this.moveToPosInArea(posInArea);
    }

    this.on("postupdate", (event: ex.PostUpdateEvent): void => {
      this.owner().update(event.engine, event.delta);
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
   * Set collision of self.
   *
   * @param collision
   */
  public setCollision(collision: ex.CollisionGroup): void {
    this.body.collider.group = collision;
  }
}
