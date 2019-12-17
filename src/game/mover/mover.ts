import { ActorWrapper } from "../actor/actor-wrapper";

export interface Mover {
  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  start(owner: ActorWrapper): void;

  /**
   * Update state and move owner.
   *
   * @param deltaTimeMS Delta time in milliseconds.
   */
  update(deltaTimeMS: number): void;
}
