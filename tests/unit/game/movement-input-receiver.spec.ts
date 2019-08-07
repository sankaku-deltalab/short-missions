import * as ex from "excalibur";
import {
  MovementInputReceiver,
  convertInputHandlers,
  InputHandlers,
  InnerInputHandlers
} from "@/game/movement-input-receiver";
import { simpleMock } from "../../test-util";

function createEngineInputMock(): ex.Input.EngineInput {
  const engineInput = simpleMock<ex.Input.EngineInput>();
  engineInput.pointers = simpleMock<ex.Input.Pointers>();
  engineInput.pointers.primary = simpleMock<ex.Input.Pointer>();
  engineInput.pointers.primary.on = jest.fn();
  engineInput.pointers.primary.off = jest.fn();
  return engineInput;
}

function setupReceiver(): {
  engineInput: ex.Input.EngineInput;
  receiver: MovementInputReceiver;
  handlers: InputHandlers;
  convertedHandlers: InnerInputHandlers;
} {
  // Given engine input
  const engineInput = createEngineInputMock();

  // And MovementInputReceiver
  const receiver = new MovementInputReceiver();

  // And movement handlers
  const handlers = {
    down: jest.fn(),
    up: jest.fn(),
    move: jest.fn()
  };
  const convertedHandlers = convertInputHandlers(handlers, receiver);

  return {
    engineInput,
    receiver,
    handlers,
    convertedHandlers
  };
}

describe("MovementInputReceiver", (): void => {
  it("can receive input from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers: _handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // Then down, up and move handler was assigned to engine input
    const commands: ("down" | "up" | "move")[] = ["down", "up", "move"];
    for (const command of commands) {
      expect(engineInput.pointers.primary.on).toBeCalledWith(
        command,
        convertedHandlers[command]
      );
    }
  });

  it("can disable receiving input from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers: _handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // And disable input
    receiver.disableInput(engineInput);

    // Then down, up and move handler was assigned to engine input
    const commands: ("down" | "up" | "move")[] = ["down", "up", "move"];
    for (const command of commands) {
      expect(engineInput.pointers.primary.off).toBeCalledWith(
        command,
        convertedHandlers[command]
      );
    }
  });

  it("can receive pointer down from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // And down was called
    const ev = simpleMock<ex.GameEvent<any, any>>();
    convertedHandlers.down(ev);

    // Then down handler was called
    expect(handlers.down).toBeCalled();
  });

  it("can receive pointer down from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // And down was called
    const ev = simpleMock<ex.GameEvent<any, any>>();
    convertedHandlers.down(ev);

    // Then down handler was called
    expect(handlers.down).toBeCalled();
  });

  it("can receive pointer up from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // And down was called
    const ev = simpleMock<ex.GameEvent<any, any>>();
    convertedHandlers.down(ev);

    // And up was called
    const ev2 = simpleMock<ex.GameEvent<any, any>>();
    convertedHandlers.up(ev2);

    // Then up handler was called
    expect(handlers.up).toBeCalled();
  });

  it("can receive pointer move from engine", (): void => {
    // Given engine input
    // And MovementInputReceiver
    // And movement handlers
    const {
      engineInput,
      receiver,
      handlers,
      convertedHandlers
    } = setupReceiver();

    // When enable input
    receiver.enableInput(engineInput, convertedHandlers);

    // And down was called
    const ev = ({ pos: new ex.Vector(0, 0) } as any) as ex.GameEvent<any, any>;
    convertedHandlers.down(ev);

    // And move was called
    const ev2 = ({ pos: new ex.Vector(3, 5) } as any) as ex.GameEvent<any, any>;
    convertedHandlers.move(ev2);

    // Then up handler was called
    expect(handlers.move).toBeCalled();
  });
});
