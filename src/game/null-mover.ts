import { Mover } from "./mover";
import { EventDispatcher } from "./event-dispatcher";
import { ActorWrapper } from "./actor-wrapper";

export interface NullMoverArgs {
  onEnteringToArea: EventDispatcher<void>;
  onExitingFromArea: EventDispatcher<void>;
}

/**
 * Mover with NullObject pattern.
 * This mover do not move owner.
 */
export class NullMover implements Mover {
  /** Dispatch when owner entered to area. */
  public readonly onEnteringToArea: EventDispatcher<void>;

  /** Dispatch when owner exiting from area. */
  public readonly onExitingFromArea: EventDispatcher<void>;

  public constructor(args: NullMoverArgs) {
    this.onEnteringToArea = args.onEnteringToArea;
    this.onExitingFromArea = args.onExitingFromArea;
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public start(_owner: ActorWrapper): void {}

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public update(_deltaTimeMS: number): void {}
}
