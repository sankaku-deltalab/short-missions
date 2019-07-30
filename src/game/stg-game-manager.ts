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
import { Collisions } from "./collision-groups";
import { HealthComponent } from "./health-component";
import { ZIndex } from "./z-index";

export class STGGameManager {
  public readonly engine: ex.Engine;
  public readonly coordinatesConverter: CoordinatesConverter;
  public readonly bulletsPools: Map<string, BulletsPool> = new Map();
  public readonly collisions: Collisions;

  public constructor(engine: ex.Engine) {
    this.engine = engine;

    this.coordinatesConverter = this.createCoordinatesConverter(engine);
    this.collisions = new Collisions();
  }

  public async playMission(_missionId: number): Promise<void> {
    // Setup scene
    const scene = new ex.Scene(this.engine);

    // TODO: Setup enemy setting

    // TODO: Setup background
    const posPoint = this.coordinatesConverter.centerInCanvas;
    const background = new ex.Actor({
      pos: new ex.Vector(posPoint.x, posPoint.y),
      width: this.coordinatesConverter.visualAreaSizeInCanvas.x,
      height: this.coordinatesConverter.visualAreaSizeInCanvas.y,
      color: ex.Color.LightGray
    });
    scene.add(background);
    background.setZIndex(ZIndex.background1);

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

    // TODO: Start game
    const enemyPos = new ex.Vector(
      this.engine.halfDrawWidth * (1 / 4),
      this.engine.drawHeight * (1 / 4)
    );
    const enemy = this.setupTestEnemy(
      scene,
      enemyPos,
      this.coordinatesConverter
    );

    this.engine.addScene("mission", scene);
    this.engine.goToScene("mission");
    if (pc.weapon !== undefined) pc.weapon.startFiring();

    // TODO: Wait end game

    // wait enemy died
    const waitEnemyDied = (nodeCallback: (err: Error | null) => void): void => {
      const f2 = (): void => {
        nodeCallback(null);
        enemy.health.onDied.remove(f2);
      };
      enemy.health.onDied.add(f2);
    };
    await promisify(waitEnemyDied)();

    const pause = promisify((milliSec: number, f: Function): void => {
      setTimeout(f, milliSec);
    });
    await pause(2 * 1000);

    // TODO: Show result
    // Clear all
    inputReceiver.disableInput(this.engine.input);
    this.engine.removeScene(scene);
    this.engine.goToScene("root");
  }

  private createCoordinatesConverter(engine: ex.Engine): CoordinatesConverter {
    const aspectRatio = 4 / 3;
    const rawWidth = engine.drawWidth;
    const rawHeight = engine.drawHeight;
    const size = {
      width: Math.min(rawWidth, rawHeight / aspectRatio),
      height: Math.min(rawHeight, rawWidth * aspectRatio)
    };
    return new CoordinatesConverter({
      areaSizeInCanvas: size.height,
      visualAreaSizeInCanvas: { x: size.width, y: size.height },
      centerInCanvas: { x: size.width / 2, y: size.height / 2 }
    });
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
        color: ex.Color.Black,
        collisions: this.collisions
      });
      bullet.on("exitviewport", (): void => {
        bullet.kill();
      });
      bullet.on("postkill", (): void => {
        bulletsPool.push(bullet);
      });
      bulletsPool.push(bullet);
    }
    this.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzle = new Muzzle({
      bulletsPool,
      coordinatesConverter,
      damage: 10,
      pos: new ex.Vector(0, -50),
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
      health: new HealthComponent(3, 7),
      isPlayerSide: true,
      collisions: this.collisions
    });

    scene.add(pc);
    scene.add(muzzle);
    pc.add(muzzle);
    pc.setZIndex(ZIndex.player);
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

  private setupTestEnemy(
    scene: ex.Scene,
    pos: ex.Vector,
    _coordinatesConverter: CoordinatesConverter
  ): Character {
    // // Create Bullets
    // const bulletsPool = new BulletsPool();
    // for (const _ of Array(100)) {
    //   const bullet = new Bullet({
    //     width: 30,
    //     height: 40,
    //     color: ex.Color.Black,
    //     collisions: this.collisions
    //   });
    //   bullet.on("exitviewport", (): void => {
    //     bullet.kill();
    //     bulletsPool.push(bullet);
    //   });
    //   bulletsPool.push(bullet);
    // }
    // this.bulletsPools.set("player", bulletsPool);

    // // Create Muzzle
    // const muzzle = new Muzzle({
    //   bulletsPool,
    //   coordinatesConverter,
    //   isPlayerSide: true
    // });

    // // Create weapon
    // const player = gt.createDefaultPlayer({
    //   centerMuzzle: muzzle
    // });
    // player.setGunTree(
    //   gt.concat(
    //     gt.useMuzzle("centerMuzzle"),
    //     gt.mltSpeed(2),
    //     gt.repeat({ times: 1, interval: 4 }, gt.fire(gt.bullet()))
    //   )
    // );
    // const weapon = new Weapon(player);

    // Create player character
    const enemy = new Character({
      pos,
      // weapon,
      width: 100,
      height: 100,
      color: ex.Color.Rose,
      health: new HealthComponent(1000, 1000),
      isPlayerSide: false,
      collisions: this.collisions
    });

    scene.add(enemy);
    // scene.add(muzzle);
    // enemy.add(muzzle);

    enemy.setZIndex(ZIndex.enemy);
    return enemy;
  }
}
