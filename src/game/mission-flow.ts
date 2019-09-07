import { promisify } from "util";
import * as ex from "excalibur";
import * as gt from "guntree";
import { Character } from "./actor/character";
import {
  MovementInputReceiver,
  convertInputHandlers
} from "./mover/movement-input-receiver";
import { Muzzle } from "./weapon/muzzle";
import { CoordinatesConverter } from "./common/coordinates-converter";
import { BulletsPool } from "./weapon/bullets-pool";
import { Bullet } from "./weapon/bullet";
import { HealthComponent } from "./health-component";
import { ZIndex } from "./common/z-index";
import { ExtendedActor } from "./actor/extended-actor";
import { STGGameManager } from "./stg-game-manager";
import { EventDispatcher } from "./common/event-dispatcher";
import { WeaponCreator } from "./enemies-builder/weapon-creator";
import { NullMover } from "./mover/null-mover";
import {
  StaticEnemyMoverCreator,
  EnemyMoveRouteType
} from "./enemies-builder/static-enemy-mover-creator";
import { MuzzleCreator } from "./enemies-builder/muzzle-creator";
import { EnemyCreator } from "./enemies-builder/enemy-creator";
import { SquadBuilder } from "./enemies-builder/squad-builder";
import { Squad } from "./enemies-builder/squad";
import { SideEnter } from "./contents/activate-position-generator/side-enter";

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
    const squad = new Squad(new EventDispatcher());
    const squadBuilder = this.setupSquadBuilder(
      scene,
      squad,
      coordinatesConverter
    );
    this.stgGameManager.engine.on(
      "preupdate",
      (event: ex.PreUpdateEvent): void => {
        squadBuilder.update(event.delta);
      }
    );

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
    squadBuilder.start();

    engine.addScene("mission", scene);
    engine.goToScene("mission");
    if (pc.weapon !== undefined) pc.weapon.startFiring();

    // TODO: Wait end game

    // wait enemy died
    const waitEnemiesFinished = (
      nodeCallback: (err: Error | null) => void
    ): void => {
      squad.onAllMemberFinished.add((): void => {
        nodeCallback(null);
      });
    };

    const pause = promisify((milliSec: number, f: Function): void => {
      setTimeout(f, milliSec);
    });

    await Promise.race([promisify(waitEnemiesFinished)(), pause(10 * 1000)]);

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
      actor: pcActor,
      mover: new NullMover({
        onEnteringToArea: new EventDispatcher<void>(),
        onExitingFromArea: new EventDispatcher<void>()
      })
    });

    pc.actor.add(muzzle.actor);
    muzzle.actor.pos = muzzle.actor.pos.sub(pc.actor.pos);
    scene.add(pc.actor);
    scene.add(muzzle.actor);

    // Create weapon
    const wc = new WeaponCreator(
      gt.concat(
        gt.useMuzzle("centerMuzzle"),
        gt.mltSpeed(2),
        gt.repeat({ times: 1, interval: 4 }, gt.fire(gt.bullet()))
      )
    );
    pc.setWeapon(
      wc.create({
        centerMuzzle: muzzle
      })
    );
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

  private setupSquadBuilder(
    scene: ex.Scene,
    squad: Squad,
    coordinatesConverter: CoordinatesConverter
  ): SquadBuilder {
    const collisions = this.stgGameManager.collisions;

    // Create Bullets
    const bulletsPool = new BulletsPool();
    for (const _ of Array(100)) {
      const bulletActor = new ExtendedActor({
        coordinatesConverter,
        width: 10,
        height: 10,
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
    this.stgGameManager.bulletsPools.set("enemy", bulletsPool);

    const muzzleCreator = new MuzzleCreator({
      collisions,
      coordinatesConverter,
      isPlayerSide: false,
      muzzleInfoList: [
        {
          bulletsPool,
          name: "centerMuzzle",
          offsetInArea: ex.Vector.Zero,
          damage: 1
        }
      ]
    });
    const weaponCreator = new WeaponCreator(
      gt.concat(
        gt.useMuzzle("centerMuzzle"),
        gt.mltSpeed(0.5),
        gt.addAngle(180),
        gt.sequential(
          gt.repeat({ times: 4, interval: 10 }, gt.fire(gt.bullet())),
          gt.wait(15),
          gt.repeat(
            { times: 2, interval: 3 },
            gt.nWay({ ways: 3, totalAngle: 90 }, gt.fire(gt.bullet()))
          ),
          gt.wait(30)
        )
      )
    );
    const activateTime = 1;
    const moverCreator = new StaticEnemyMoverCreator({
      activateTime,
      routeType: EnemyMoveRouteType.sideMove,
      moveSpeedInArea: 0.25,
      isLeftSide: true
    });

    const health = 50;
    const enemyCreator = new EnemyCreator({
      collisions,
      coordinatesConverter,
      health,
      muzzleCreator,
      weaponCreator,
      staticEnemyMoverCreator: moverCreator,
      sizeInArea: new ex.Vector(0.125, 0.125 / 2)
    });

    const playerDPS = 150;
    const posGen = new SideEnter();
    const activateTimeAndPositions = posGen.generate(
      health / playerDPS,
      new ex.Vector(0.1, 0.1),
      2,
      true
    );

    return new SquadBuilder({
      squad,
      scene,
      activateTime,
      enemyCreator,
      onFinished: new EventDispatcher(),
      activateTimeAndPositions
    });
  }
}
