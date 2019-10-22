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
import { MuzzleCreator } from "./enemies-builder/muzzle-creator";
import { Collisions } from "./common/collision-groups";
import {
  EnemyInfo,
  EnemyMoveType,
  StageEnemyCreator
} from "./enemies-builder/stage-enemy-creator";
import { SquadBuilderStarter } from "./enemies-builder/squad-builder-starter";

function createBulletsBool(
  bulletsNum: number,
  coordinatesConverter: CoordinatesConverter,
  collisions: Collisions,
  sizeInArea: ex.Vector
): BulletsPool {
  const bulletsPool = new BulletsPool();
  for (const _ of Array(bulletsNum)) {
    const bulletActor = new ExtendedActor({
      coordinatesConverter,
      sizeInArea,
      color: ex.Color.Black,
      collisions
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
  return bulletsPool;
}

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
    const starter = this.setupSquadBuilder(scene, coordinatesConverter);
    this.stgGameManager.engine.on(
      "preupdate",
      (event: ex.PreUpdateEvent): void => {
        starter.update(event.delta);
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
    starter.start();

    engine.addScene("mission", scene);
    engine.goToScene("mission");
    pc.startFiring();

    // TODO: Wait end game

    // wait enemy died
    const waitEnemiesFinished = (
      nodeCallback: (err: Error | null) => void
    ): void => {
      const squads = starter.takeStartingSquads();
      let finishedSquadCount = 0;
      for (const sq of squads) {
        sq.onAllMemberFinished((): void => {
          finishedSquadCount += 1;
          if (finishedSquadCount === squads.length) {
            nodeCallback(null);
          }
        });
      }
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
    const collisions = this.stgGameManager.collisions;
    // Create Bullets
    const bulletsPool = createBulletsBool(
      100,
      coordinatesConverter,
      collisions,
      new ex.Vector(1 / 2 ** 3, 1 / 2 ** 4)
    );
    this.stgGameManager.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzleActor = new ExtendedActor({
      coordinatesConverter,
      pos: coordinatesConverter.toCanvasVector(new ex.Vector(0.125 / 4, 0)),
      collisions: this.stgGameManager.collisions
    });
    const muzzle = new Muzzle({
      bulletsPool,
      damage: 10,
      isPlayerSide: true,
      actor: muzzleActor
    });
    const muzzles = new Map([["centerMuzzle", muzzle]]);

    // Create weapon
    const wc = new WeaponCreator(
      gt.concat(
        gt.useMuzzle("centerMuzzle"),
        gt.mltSpeed(2),
        gt.repeat({ times: 1, interval: 4 }, gt.fire(gt.bullet()))
      )
    );
    const weapon = wc.create(muzzles);

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
      }),
      weapon,
      muzzles
    });
    pc.addSelfToScene(scene);
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
    coordinatesConverter: CoordinatesConverter
  ): SquadBuilderStarter {
    const collisions = this.stgGameManager.collisions;

    // Create Bullets
    const bulletsPool = createBulletsBool(
      100,
      coordinatesConverter,
      collisions,
      new ex.Vector(1 / 2 ** 5, 1 / 2 ** 5)
    );
    this.stgGameManager.bulletsPools.set("enemy", bulletsPool);

    // Create enemy info
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
        gt.useVirtualMuzzle(gt.aimingMuzzle()),
        gt.mltSpeed(0.5),
        gt.sequential(
          gt.repeat({ times: 3, interval: 30 }, gt.fire(gt.bullet())),
          gt.wait(15),
          gt.repeat(
            { times: 2, interval: 10 },
            gt.nWay({ ways: 3, totalAngle: 90 }, gt.fire(gt.bullet()))
          ),
          gt.wait(30)
        )
      )
    );
    const killTime = 0.5;
    const sizeInArea = new ex.Vector(0.125 / 2, 0.125);
    const isSmallSize = false;
    const moveSpeedInArea = 0.25;

    const enemyInfoId = 0;
    const enemyInfo: Map<number, EnemyInfo> = new Map([
      [
        enemyInfoId,
        {
          muzzleCreator,
          weaponCreator,
          killTime,
          sizeInArea,
          isSmallSize,
          moveSpeedInArea
        }
      ]
    ]);

    const playerDPS = 10 * (60 / 4);
    const sec = new StageEnemyCreator({
      scene,
      collisions,
      coordinatesConverter,
      playerDPS,
      moveTime: 0.5,
      enemyInfo,
      squadInfo: [
        {
          enemyInfoId,
          moveType: EnemyMoveType.sideIn,
          activateInOtherSideOfPlayer: true,
          overTime: 0,
          killTime: 2,
          activateTime: 0.5
        },
        {
          enemyInfoId,
          moveType: EnemyMoveType.topIn,
          activateInOtherSideOfPlayer: true,
          overTime: 0,
          killTime: 2,
          activateTime: 0.5
        },
        {
          enemyInfoId,
          moveType: EnemyMoveType.topWideIn,
          activateInOtherSideOfPlayer: true,
          overTime: 0,
          killTime: 2,
          activateTime: 0.5
        }
      ]
    });

    return sec.create(true);
  }
}
