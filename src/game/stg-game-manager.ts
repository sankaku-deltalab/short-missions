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
import { ExtendedActor } from "./extended-actor";

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
    const pcPosInArea = new ex.Vector(-0.25, 0);
    const pc = this.setupPlayerCharacter(
      scene,
      pcPosInArea,
      this.coordinatesConverter
    );

    // Setup input
    const inputReceiver = this.setupMovementInputReceiver(
      this.engine.input,
      pc
    );

    // TODO: Start game
    const enemyPosInArea = new ex.Vector(0.25, -0.25);
    const enemy = this.setupTestEnemy(
      scene,
      enemyPosInArea,
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
    posInArea: ex.Vector,
    coordinatesConverter: CoordinatesConverter
  ): Character {
    // Create Bullets
    const bulletsPool = new BulletsPool();
    for (const _ of Array(100)) {
      const bulletActor = new ExtendedActor({
        coordinatesConverter,
        width: 30,
        height: 40,
        color: ex.Color.Black,
        collisions: this.collisions
      });
      const bullet = new Bullet(bulletActor);
      bulletActor.on("exitviewport", (): void => {
        bullet.kill();
      });
      bulletActor.on("postkill", (): void => {
        bulletsPool.push(bullet);
      });
      bulletsPool.push(bullet);
    }
    this.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzleActor = new ExtendedActor({
      coordinatesConverter,
      posInArea: posInArea.add(new ex.Vector(0.125 / 4, 0)),
      collisions: this.collisions
    });
    const muzzle = new Muzzle({
      bulletsPool,
      damage: 10,
      isPlayerSide: true,
      actor: muzzleActor
    });

    // Create player character
    const pcActor = new ExtendedActor({
      posInArea,
      coordinatesConverter,
      width: 50,
      height: 50,
      color: ex.Color.Azure,
      collisions: this.collisions
    });
    const pc = new Character({
      health: new HealthComponent(3, 7),
      isPlayerSide: true,
      actor: pcActor
    });

    pc.actor.add(muzzle.actor);
    muzzle.actor.pos = muzzle.actor.pos.sub(pc.actor.pos);
    scene.add(pc.actor);
    scene.add(muzzle.actor);

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
    pc.setWeapon(weapon);
    pc.actor.setZIndex(ZIndex.player);
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
      pc.actor.pos = pc.actor.pos.add(delta);
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
    posInArea: ex.Vector,
    coordinatesConverter: CoordinatesConverter
  ): Character {
    // Create enemy
    const enemyActor = new ExtendedActor({
      posInArea,
      coordinatesConverter,
      width: 100,
      height: 100,
      color: ex.Color.Rose,
      collisions: this.collisions
    });
    const enemy = new Character({
      health: new HealthComponent(1000, 1000),
      isPlayerSide: false,
      actor: enemyActor
    });

    scene.add(enemy.actor);

    enemy.actor.setZIndex(ZIndex.enemy);
    return enemy;
  }
}
