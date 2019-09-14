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

  /**
   * Add event called when entering to area.
   *
   * @param event Event remover
   */
  onEnteringToArea(event: () => void): () => void;

  /**
   * Add event called when exiting from area.
   *
   * @param event Event remover
   */
  onExitingFromArea(event: () => void): () => void;
}
