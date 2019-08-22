import * as ex from "excalibur";
import { Collisions } from "./collision-groups";
import { CoordinatesConverter } from "./coordinates-converter";
import { ActorWrapper } from "./actor-wrapper";

export interface ExtendedActorArgs extends ex.IActorArgs {
  posInArea?: ex.Vector;
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
}

export class ExtendedActor extends ex.Actor {
  public readonly collisions: Collisions;
  public readonly coordinatesConverter: CoordinatesConverter;
  private ownerInner?: ActorWrapper;

  public constructor(args: ExtendedActorArgs) {
    // to avoid assign posInArea when called super class constructor, delete posInArea from args
    const posInArea = args.posInArea;
    delete args.posInArea;

    super(args);
    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;

    if (posInArea !== undefined) {
      this.posInArea = posInArea;
    }

    this.on("postupdate", (event: ex.PostUpdateEvent): void => {
      if (this.ownerInner === undefined) return;
      this.ownerInner.update(event.engine, event.delta);
    });
  }

  public get owner(): ActorWrapper {
    if (this.ownerInner === undefined) throw new Error("Owner was not set");
    return this.ownerInner;
  }

  public set owner(wrapper: ActorWrapper) {
    if (this.ownerInner !== undefined) throw new Error("Owner was already set");
    this.ownerInner = wrapper;
  }

  public get posInArea(): ex.Vector {
    const posInArea = this.coordinatesConverter.toAreaPoint(this.pos);
    return new ex.Vector(posInArea.x, posInArea.y);
  }

  public set posInArea(posInArea: ex.Vector) {
    const posInCanvas = this.coordinatesConverter.toCanvasPoint(posInArea);
    this.pos = new ex.Vector(posInCanvas.x, posInCanvas.y);
  }

  public get posInVisualArea(): ex.Vector {
    const posInVisualArea = this.coordinatesConverter.toVisualAreaPoint(
      this.pos
    );
    return new ex.Vector(posInVisualArea.x, posInVisualArea.y);
  }

  public getWorldPosInArea(): ex.Vector {
    const worldPosInArea = this.coordinatesConverter.toAreaPoint(
      this.getWorldPos()
    );
    return new ex.Vector(worldPosInArea.x, worldPosInArea.y);
  }

  public setCollision(collision: ex.CollisionGroup): void {
    this.body.collider.group = collision;
  }
}
