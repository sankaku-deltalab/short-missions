import { ActorWrapper } from "../actor/actor-wrapper";
import { EventDispatcher } from "../common/event-dispatcher";

export interface Mover {
  /** Dispatch when owner entered to area. */
  onEnteringToArea: EventDispatcher<void>;

  /** Dispatch when owner exiting from area. */
  onExitingFromArea: EventDispatcher<void>;

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
