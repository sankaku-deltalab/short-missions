import * as ex from "excalibur";

export interface InputHandlers {
  down: (event: ex.Input.PointerEvent, receiver: MovementInputReceiver) => void;
  up: (event: ex.Input.PointerEvent, receiver: MovementInputReceiver) => void;
  move: (
    event: ex.Input.PointerEvent,
    delta: ex.Vector,
    receiver: MovementInputReceiver
  ) => void;
}

export interface InnerInputHandlers {
  down: (event: ex.GameEvent<any, any>) => void;
  up: (event: ex.GameEvent<any, any>) => void;
  move: (event: ex.GameEvent<any, any>) => void;
}

/**
 * Receive input for player character movement.
 */
export class MovementInputReceiver {
  private oldTouchPosition: ex.Vector | null;
  private activeHandlers: InnerInputHandlers | null;

  public constructor() {
    this.oldTouchPosition = null;
    this.activeHandlers = null;
  }

  /**
   * Enable input from engine.
   *
   * @param engineInput
   */
  public enableInput(
    engineInput: ex.Input.EngineInput,
    handlers: InnerInputHandlers
  ): void {
    this.activeHandlers = handlers;
    engineInput.pointers.primary.on("down", handlers.down);
    engineInput.pointers.primary.on("up", handlers.up);
    engineInput.pointers.primary.on("move", handlers.move);
  }

  public disableInput(engineInput: ex.Input.EngineInput): void {
    if (this.activeHandlers === null) throw new Error("Input is not enabled");
    engineInput.pointers.primary.off("down", this.activeHandlers.down);
    engineInput.pointers.primary.off("up", this.activeHandlers.up);
    engineInput.pointers.primary.off("move", this.activeHandlers.move);
    this.activeHandlers = null;
  }

  /**
   * Notify pointer down.
   *
   * @param pos Pointer downed position
   */
  public pointerDownAt(pos: ex.Vector): void {
    this.oldTouchPosition = pos;
  }

  /**
   * Notify pointer up.
   */
  public pointerUp(): void {
    this.oldTouchPosition = null;
  }

  public updatePointerMove(dest: ex.Vector): ex.Vector {
    if (this.oldTouchPosition === null)
      throw new Error("Pointer was moved but not down");
    const delta = dest.sub(this.oldTouchPosition);
    this.oldTouchPosition = dest;
    return delta;
  }
}

export function convertInputHandlers(
  outerHandlers: InputHandlers,
  receiver: MovementInputReceiver
): InnerInputHandlers {
  const down = (event: ex.GameEvent<any, any>): void => {
    const ev = event as ex.Input.PointerEvent;
    receiver.pointerDownAt(ev.pos);
    outerHandlers.down(ev, receiver);
  };

  const up = (event: ex.GameEvent<any, any>): void => {
    const ev = event as ex.Input.PointerEvent;
    receiver.pointerUp();
    outerHandlers.up(ev, receiver);
  };

  const move = (event: ex.GameEvent<any, any>): void => {
    const ev = event as ex.Input.PointerEvent;
    const delta = receiver.updatePointerMove(ev.pos);
    outerHandlers.move(ev, delta, receiver);
  };

  return {
    down,
    up,
    move
  };
}
