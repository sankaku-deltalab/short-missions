import * as ex from "excalibur";
import { Collisions } from "./collision-groups";
import { CoordinatesConverter } from "./coordinates-converter";
import { ActorWrapper } from "./actor-wrapper";

export interface ExtendedActorArgs extends ex.IActorArgs {
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
}

export class ExtendedActor extends ex.Actor {
  public readonly collisions: Collisions;
  public readonly coordinatesConverter: CoordinatesConverter;
  private ownerInner?: ActorWrapper;

  public constructor(args: ExtendedActorArgs) {
    super(args);
    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;
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

  public get posInVisualArea(): ex.Vector {
    const posInVisualArea = this.coordinatesConverter.toVisualAreaPoint(
      this.pos
    );
    return new ex.Vector(posInVisualArea.x, posInVisualArea.y);
  }
}
