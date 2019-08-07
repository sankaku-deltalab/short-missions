import * as ex from "excalibur";
import { Collisions } from "./collision-groups";

export interface ExtendedActorArgs extends ex.IActorArgs {
  collisions: Collisions;
}
