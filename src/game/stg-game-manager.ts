import { promisify } from "util";
import * as ex from "excalibur";
import { Character } from "./character";
import {
  MovementInputReceiver,
  convertInputHandlers
} from "./movement-input-receiver";

export class STGGameManager {
  public readonly engine: ex.Engine;
  private stgGameManager!: STGGameManager;

  public constructor(engine: ex.Engine) {
    this.engine = engine;
  }

  public async playMission(_missionId: number): Promise<void> {
    // Setup scene
    const scene = new ex.Scene(this.engine);

    // TODO: Setup enemy setting
    // Setup player character
    const pc = this.createPlayerCharacter();
    pc.pos = new ex.Vector(
      this.engine.halfDrawWidth,
      this.engine.drawHeight * (3 / 4)
    );
    scene.add(pc);

    // Setup input
    const inputReceiver = this.setupMovementInputReceiver(
      this.engine.input,
      pc
    );

    // TODO: Setup haikei
    // TODO: Start game
    this.engine.addScene("mission", scene);
    this.engine.goToScene("mission");

    // TODO: Wait end game
    const pause = promisify((milliSec: number, f: Function): void => {
      setTimeout(f, milliSec);
    });
    await pause(5000);

    // TODO: Show result
    // Clear all
    inputReceiver.disableInput(this.engine.input);
    this.engine.removeScene(scene);
    this.engine.goToScene("root");
  }

  private createPlayerCharacter(): Character {
    // TODO: Add Weapon
    return new Character({
      width: 50,
      height: 50,
      color: ex.Color.Azure,
      isPlayerSide: true
    });
  }

  private setupMovementInputReceiver(
    engineInput: ex.Input.EngineInput,
    pc: Character
  ): MovementInputReceiver {
    const receiver = new MovementInputReceiver();
    const down = (
      _event: ex.Input.PointerEvent,
      _receiver: MovementInputReceiver
    ): void => {};
    const up = (
      _event: ex.Input.PointerEvent,
      _receiver: MovementInputReceiver
    ): void => {};
    const move = (
      _event: ex.Input.PointerEvent,
      delta: ex.Vector,
      _receiver: MovementInputReceiver
    ): void => {
      pc.pos = pc.pos.add(delta);
    };

    const handlers = {
      down,
      up,
      move
    };
    receiver.enableInput(engineInput, convertInputHandlers(handlers, receiver));

    return receiver;
  }
}
