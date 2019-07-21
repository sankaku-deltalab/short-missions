import { promisify } from "util";
import * as ex from "excalibur";
import * as gt from "guntree";
import { Character } from "./character";
import {
  MovementInputReceiver,
  convertInputHandlers
} from "./movement-input-receiver";
import { Muzzle } from "./muzzle";
import { CoordinatesConverter } from "./coordinates-converter";
import { BulletsPool } from "./bullets-pool";
import { Weapon } from "./weapon";
import { Bullet } from "./bullet";

export class STGGameManager {
  public readonly engine: ex.Engine;
  public readonly coordinatesConverter: CoordinatesConverter;
  public readonly bulletsPools: Map<string, BulletsPool> = new Map();

  public constructor(engine: ex.Engine) {
    this.engine = engine;

    const height = this.engine.drawHeight;
    const width = this.engine.drawWidth;
    this.coordinatesConverter = new CoordinatesConverter({
      areaSizeInCanvas: height,
      visualAreaSizeInCanvas: { x: width, y: height },
      centerInCanvas: { x: width / 2, y: height / 2 }
    });
  }

  public async playMission(_missionId: number): Promise<void> {
    // Setup scene
    const scene = new ex.Scene(this.engine);

    // TODO: Setup enemy setting
    // Setup player character
    const pcPos = new ex.Vector(
      this.engine.halfDrawWidth,
      this.engine.drawHeight * (3 / 4)
    );
    const pc = this.setupPlayerCharacter(
      scene,
      pcPos,
      this.coordinatesConverter
    );

    // Setup input
    const inputReceiver = this.setupMovementInputReceiver(
      this.engine.input,
      pc
    );

    // TODO: Setup haikei
    // TODO: Start game
    this.engine.addScene("mission", scene);
    this.engine.goToScene("mission");
    if (pc.weapon !== undefined) pc.weapon.startFiring();

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

  private setupPlayerCharacter(
    scene: ex.Scene,
    pos: ex.Vector,
    coordinatesConverter: CoordinatesConverter
  ): Character {
    // Create Bullets
    const bulletsPool = new BulletsPool();
    for (const _ of Array(100)) {
      const bullet = new Bullet({
        width: 30,
        height: 40,
        color: ex.Color.Black
      });
      bullet.on("exitviewport", (): void => {
        bullet.kill();
        bulletsPool.push(bullet);
      });
      bulletsPool.push(bullet);
    }
    this.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzle = new Muzzle({
      bulletsPool,
      coordinatesConverter,
      isPlayerSide: true
    });

    // Create weapon
    const player = gt.createDefaultPlayer({
      centerMuzzle: muzzle
    });
    player.setGunTree(
      gt.concat(
        gt.useMuzzle("centerMuzzle"),
        gt.mltSpeed(2),
        gt.repeat({ times: 1, interval: 4 }, gt.fire(gt.bullet()))
      )
    );
    const weapon = new Weapon(player);

    // Create player character
    const pc = new Character({
      pos,
      weapon,
      width: 50,
      height: 50,
      color: ex.Color.Azure,
      isPlayerSide: true
    });

    scene.add(pc);
    scene.add(muzzle);
    pc.add(muzzle);
    return pc;
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
