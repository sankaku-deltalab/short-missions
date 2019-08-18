import * as ex from "excalibur";
import { ExtendedActor } from "./extended-actor";

export interface ActorWrapper {
  actor: ExtendedActor;
  update(engine: ex.Engine, deltaTimeMS: number): void;
  kill(): void;
}
