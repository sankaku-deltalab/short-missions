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
import { HealthComponent } from "./health-component";
import { ZIndex } from "./z-index";
import { ExtendedActor } from "./extended-actor";
import { STGGameManager } from "./stg-game-manager";

export class MissionFlow {
  private readonly stgGameManager: STGGameManager;

  public constructor(stgGameManager: STGGameManager) {
    this.stgGameManager = stgGameManager;
  }

  public async playMission(_missionId: number): Promise<void> {
    const engine = this.stgGameManager.engine;
    const coordinatesConverter = this.stgGameManager.coordinatesConverter;

    // Setup scene
    const scene = new ex.Scene(engine);

    // TODO: Setup enemy setting

    // TODO: Setup background
    const posPoint = coordinatesConverter.centerInCanvas;
    const background = new ex.Actor({
      pos: new ex.Vector(posPoint.x, posPoint.y),
      width: coordinatesConverter.visualAreaSizeInCanvas.x,
      height: coordinatesConverter.visualAreaSizeInCanvas.y,
      color: ex.Color.LightGray
    });
    scene.add(background);
    background.setZIndex(ZIndex.background1);

    // Setup player character
    const pcPosInArea = new ex.Vector(-0.25, 0);
    const pc = this.setupPlayerCharacter(
      scene,
      pcPosInArea,
      coordinatesConverter
    );

    // Setup input
    const inputReceiver = this.setupMovementInputReceiver(engine.input, pc);

    // TODO: Start game
    const enemyPosInArea = new ex.Vector(0.25, -0.25);
    const enemy = this.setupTestEnemy(
      scene,
      enemyPosInArea,
      coordinatesConverter
    );

    engine.addScene("mission", scene);
    engine.goToScene("mission");
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
    inputReceiver.disableInput(engine.input);
    engine.removeScene(scene);
    engine.goToScene("root");
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
        collisions: this.stgGameManager.collisions
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
    this.stgGameManager.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzleActor = new ExtendedActor({
      coordinatesConverter,
      posInArea: posInArea.add(new ex.Vector(0.125 / 4, 0)),
      collisions: this.stgGameManager.collisions
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
      collisions: this.stgGameManager.collisions
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
      collisions: this.stgGameManager.collisions
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
