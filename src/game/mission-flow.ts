import { promisify } from "util";
import * as ex from "excalibur";
import * as gt from "guntree";
import { Random, MersenneTwister19937 } from "random-js";
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
  StageEnemyCreator,
  SquadInfo
} from "./enemies-builder/stage-enemy-creator";
import { SquadBuilderStarter } from "./enemies-builder/squad-builder-starter";
import { OutGameUIRequest } from "./ui-request";
import pcTexturePath from "@/assets/game/pc.png";
import playerBulletTexturePath from "@/assets/game/pb.png";
import enemyBulletTexturePath from "@/assets/game/eb.png";
import enemyTexturePath from "@/assets/game/en.png";
import * as smallGuns from "./guntree-patterns/small-guns";
import * as middleGuns from "./guntree-patterns/middle-guns";

export enum MissionFinishReason {
  clear = "clear",
  failed = "failed",
  aborted = "aborted",
  unknown = "unknown"
}

function createBulletsBool(
  bulletsNum: number,
  coordinatesConverter: CoordinatesConverter,
  collisions: Collisions,
  sizeInArea: ex.Vector,
  texturePath: string,
  textureSizeInArea: number
): BulletsPool {
  const bullets = Array(bulletsNum)
    .fill(0)
    .map(
      (): Bullet => {
        const bulletActor = new ExtendedActor({
          coordinatesConverter,
          sizeInArea,
          color: ex.Color.Black,
          collisions,
          onEnteringToArea: new EventDispatcher<void>(),
          onExitingFromArea: new EventDispatcher<void>()
        });
        return new Bullet(bulletActor, new EventDispatcher());
      }
    );
  const bulletsPool = new BulletsPool();

  const texture = new ex.Texture(texturePath);
  texture.load().then(() => {
    for (const bullet of bullets) {
      const sprite = new ex.Sprite({
        image: texture,
        width: texture.width,
        height: texture.height,
        scale: ex.Vector.One.scale(
          (coordinatesConverter.areaSizeInCanvas * textureSizeInArea) /
            texture.height
        )
      });
      bullet.actor.addDrawing(sprite);
    }
  });

  for (const bullet of bullets) {
    bullet.actor.on("exitviewport", (): void => {
      bullet.kill();
    });
    bullet.actor.on("postkill", (): void => {
      bulletsPool.push(bullet);
    });
    bulletsPool.push(bullet);
  }
  return bulletsPool;
}

export class MissionFlow {
  private readonly stgGameManager: STGGameManager;
  private score = 0;

  public constructor(stgGameManager: STGGameManager) {
    this.stgGameManager = stgGameManager;
  }

  public async playMission(
    missionId: number
  ): Promise<[MissionFinishReason, number]> {
    const engine = this.stgGameManager.engine;
    const coordinatesConverter = this.stgGameManager.coordinatesConverter;
    const uiRequests = this.stgGameManager.uiRequests;

    // Setup scene
    const scene = new ex.Scene(engine);

    // TODO: Setup enemy setting
    const starter = this.setupSquadBuilder(
      missionId,
      scene,
      coordinatesConverter
    );
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

    // Setup UI
    uiRequests.outGameUIRequest = OutGameUIRequest.none;
    uiRequests.inGameUIRequests.stgUI = true;

    const updateUI = (_event: ex.PostUpdateEvent): void => {
      uiRequests.stgPlayInfo.health = pc.health();
      uiRequests.stgPlayInfo.healthMax = pc.maxHealth();
      uiRequests.stgPlayInfo.score = this.score;
    };
    engine.on("postupdate", updateUI);

    // TODO: Start game
    starter.start();

    engine.addScene("mission", scene);
    engine.goToScene("mission");
    pc.startFiring();

    // Wait end game

    // wait all enemy finished
    const waitEnemiesFinished = (
      resolve: (err: Error | null, result: MissionFinishReason) => void
    ): void => {
      const squads = starter.startingSquads();
      let finishedSquadCount = 0;
      for (const sq of squads) {
        sq.onAllMemberFinished((): void => {
          finishedSquadCount += 1;
          if (finishedSquadCount === squads.length) {
            resolve(null, MissionFinishReason.clear);
          }
        });
      }
    };

    // wait player finished
    const waitPlayerDead = (
      resolve: (err: Error | null, result: MissionFinishReason) => void
    ): void => {
      const wrappedResolve = (): void => {
        resolve(null, MissionFinishReason.failed);
      };
      pc.onDied(wrappedResolve);
    };

    // wait mission aborted
    const waitMissionAborted = (
      resolve: (err: Error | null, result: MissionFinishReason) => void
    ): void => {
      const wrappedResolve = (): void => {
        resolve(null, MissionFinishReason.aborted);
      };
      this.stgGameManager.uiRequests.stgPlayInfo.missionAbortEvent.add(
        wrappedResolve
      );
      pc.onDied(wrappedResolve);
    };

    const pause = promisify((milliSec: number, f: Function): void => {
      setTimeout(f, milliSec);
    });

    const finishReason = await Promise.race<Promise<MissionFinishReason>>([
      promisify(waitEnemiesFinished)(),
      promisify(waitPlayerDead)(),
      promisify(waitMissionAborted)()
    ]);

    // Show result
    if (finishReason === MissionFinishReason.clear) {
      uiRequests.inGameUIRequests.stageClearUI = true;
      await pause(2 * 1000);
    } else if (finishReason === MissionFinishReason.failed) {
      uiRequests.inGameUIRequests.stageFailedUI = true;
      await pause(2 * 1000);
    } else if (finishReason === MissionFinishReason.aborted) {
      // do nothing
    }

    // Clear all
    inputReceiver.disableInput(engine.input);
    engine.removeScene(scene);
    engine.goToScene("root");

    // Return to menu
    uiRequests.outGameUIRequest = OutGameUIRequest.menu;
    uiRequests.inGameUIRequests.stgUI = false;
    uiRequests.inGameUIRequests.stageClearUI = false;
    uiRequests.inGameUIRequests.stageFailedUI = false;
    engine.off("postupdate", updateUI);

    return [finishReason, this.score];
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
      new ex.Vector(1 / 2 ** 3, 1 / 2 ** 4),
      playerBulletTexturePath,
      1 / 16
    );
    for (const bullet of bulletsPool.bullets()) {
      bullet.onDealDamage(damage => {
        this.score += damage;
      });
    }
    this.stgGameManager.bulletsPools.set("player", bulletsPool);

    // Create Muzzle
    const muzzleActor = new ExtendedActor({
      coordinatesConverter,
      pos: coordinatesConverter.toCanvasVector(new ex.Vector(0.125 / 4, 0)),
      collisions: this.stgGameManager.collisions,
      onEnteringToArea: new EventDispatcher<void>(),
      onExitingFromArea: new EventDispatcher<void>()
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
        gt.mltSpeed(4),
        gt.repeat({ times: 1, interval: 4 }, gt.fire(gt.bullet()))
      )
    );
    const weapon = wc.create(muzzles);

    // Create player character
    const collisionSize = coordinatesConverter.areaSizeInCanvas / 32;
    const pcActor = new ExtendedActor({
      posInArea,
      coordinatesConverter,
      width: collisionSize,
      height: collisionSize,
      color: ex.Color.Azure,
      collisions: this.stgGameManager.collisions,
      onEnteringToArea: new EventDispatcher<void>(),
      onExitingFromArea: new EventDispatcher<void>()
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

    const pcTx = new ex.Texture(pcTexturePath);
    pcTx.load().then(() => {
      const requiredTextureHeight = coordinatesConverter.areaSizeInCanvas / 8;
      const sprite = pcTx.asSprite();
      sprite.scale = new ex.Vector(
        requiredTextureHeight / sprite.width,
        requiredTextureHeight / sprite.height
      );
      pcActor.addDrawing(sprite);
    });
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

  /**
   * Generate small, primal middle and secondary middle enemy.
   * @param randomSeed
   * @param missionRank {0, ..., 3}
   * @param muzzleCreator
   */
  private generateEnemyInfo(
    randomSeed: number,
    missionRank: number,
    muzzleCreator: MuzzleCreator
  ): [EnemyInfo, EnemyInfo, EnemyInfo] {
    const createSmall = (weapon: gt.Gun): EnemyInfo => {
      return {
        texturePath: enemyTexturePath,
        textureSizeInArea: new ex.Vector(0.125 / 2, 0.125 / 2),
        muzzleCreator: muzzleCreator,
        weaponCreator: new WeaponCreator(weapon),
        killTime: 0.1,
        sizeInArea: new ex.Vector(0.125 / 2, 0.125 / 2),
        isSmallSize: true,
        moveSpeedInArea: 0.5
      };
    };

    const createMiddle = (weapon: gt.Gun): EnemyInfo => {
      return {
        texturePath: enemyTexturePath,
        textureSizeInArea: new ex.Vector(0.125 / 2, 0.125),
        muzzleCreator: muzzleCreator,
        weaponCreator: new WeaponCreator(weapon),
        killTime: 0.5,
        sizeInArea: new ex.Vector(0.125 / 2, 0.125),
        isSmallSize: false,
        moveSpeedInArea: 0.25
      };
    };

    const smallWeapons = [
      smallGuns.basics,
      smallGuns.bigBasics,
      smallGuns.bursts
    ];
    const middleWeapons = [
      middleGuns.nWayBasics,
      middleGuns.sweepBasics,
      middleGuns.static2WayHBlocks,
      middleGuns.staticNWayVBlocks,
      middleGuns.nWayBigCenters,
      middleGuns.triangleBigCenters,
      middleGuns.accelSnakeCenters,
      middleGuns.triangleSnakeCenters
    ];
    const rand = new Random(MersenneTwister19937.seed(randomSeed));
    const smallWeaponSet = rand.pick(smallWeapons);
    const middleWeaponSet1 = rand.pick(middleWeapons);
    const middleWeaponSet2 = rand.pick(middleWeapons);

    const smallRank = missionRank + 1;
    const middleRank1 = missionRank + 1;
    const middleRank2 = missionRank;

    return [
      createSmall(smallWeaponSet[smallRank]),
      createMiddle(middleWeaponSet1[middleRank1]),
      createMiddle(middleWeaponSet2[middleRank2])
    ];
  }

  private generateSquadInfo(
    randomSeed: number,
    enemyIds: number[],
    enemyInfo: Map<number, EnemyInfo>
  ): SquadInfo[] {
    // TODO: Set overtime
    const rand = new Random(MersenneTwister19937.seed(randomSeed));
    return Array(10)
      .fill(0)
      .map(() => {
        const enemyInfoId = rand.pick(enemyIds);
        const ei = enemyInfo.get(enemyInfoId);
        if (ei === undefined) throw new Error();
        if (ei.isSmallSize) {
          const moveType = rand.pick([
            EnemyMoveType.sideIn,
            EnemyMoveType.topIn,
            EnemyMoveType.topWideIn
          ]);
          return {
            enemyInfoId,
            moveType,
            activateInOtherSideOfPlayer: true,
            overTime: 0,
            killTime: 1,
            activateTime: 0.5
          };
        }
        const moveType = rand.pick([
          EnemyMoveType.topIn,
          EnemyMoveType.topWideIn
        ]);
        return {
          enemyInfoId,
          moveType,
          activateInOtherSideOfPlayer: true,
          overTime: 0,
          killTime: 2,
          activateTime: 0.75
        };
      });
  }

  private setupSquadBuilder(
    missionId: number,
    scene: ex.Scene,
    coordinatesConverter: CoordinatesConverter
  ): SquadBuilderStarter {
    const collisions = this.stgGameManager.collisions;

    // Create Bullets
    const bulletsPool = createBulletsBool(
      100,
      coordinatesConverter,
      collisions,
      new ex.Vector(1 / 2 ** 6, 1 / 2 ** 6),
      enemyBulletTexturePath,
      1 / 40
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
        },
        {
          bulletsPool,
          name: "rightMuzzle",
          offsetInArea: new ex.Vector(0, 0.05),
          damage: 1
        },
        {
          bulletsPool,
          name: "leftMuzzle",
          offsetInArea: new ex.Vector(0, -0.05),
          damage: 1
        }
      ]
    });

    const missionIdMax = 20;
    const missionRank = Math.floor((4 * missionId) / (missionIdMax + 1));
    const enemyInfoRaw = this.generateEnemyInfo(
      missionId,
      missionRank,
      muzzleCreator
    );
    const enemyInfo: Map<number, EnemyInfo> = new Map([
      [0, enemyInfoRaw[0]],
      [1, enemyInfoRaw[1]],
      [2, enemyInfoRaw[2]]
    ]);

    const playerDPS = 10 * (60 / 4);
    const sec = new StageEnemyCreator({
      scene,
      collisions,
      coordinatesConverter,
      playerDPS,
      moveTime: 1,
      enemyInfo,
      squadInfo: this.generateSquadInfo(missionId, [0, 1, 2], enemyInfo)
    });

    return sec.create(true);
  }
}
