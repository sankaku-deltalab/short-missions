import { Mover } from "./mover";
import { EventDispatcher } from "../common/event-dispatcher";
import { ActorWrapper } from "../actor/actor-wrapper";

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
  private readonly _onEnteringToArea: EventDispatcher<void>;

  /** Dispatch when owner exiting from area. */
  private readonly _onExitingFromArea: EventDispatcher<void>;

  public constructor(args: NullMoverArgs) {
    this._onEnteringToArea = args.onEnteringToArea;
    this._onExitingFromArea = args.onExitingFromArea;
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public start(_owner: ActorWrapper): void {
    this._onEnteringToArea.dispatch();
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public update(_deltaTimeMS: number): void {}

  /**
   * Add event called when entering to area.
   *
   * @param event Event remover
   */
  onEnteringToArea(event: () => void): () => void {
    return this._onEnteringToArea.add(event);
  }

  /**
   * Add event called when exiting from area.
   *
   * @param event Event remover
   */
  onExitingFromArea(event: () => void): () => void {
    return this._onExitingFromArea.add(event);
  }
}
