import * as ex from "excalibur";
import { WeaponCreator } from "./weapon-creator";
import { SquadBuilderStarter, SquadBuilderInfo } from "./squad-builder-starter";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { EnemyCreator } from "./enemy-creator";
import { MuzzleCreator } from "./muzzle-creator";
import { SquadBuilder } from "./squad-builder";
import { Squad, SquadFinishedReason } from "./squad";
import { EventDispatcher } from "../common/event-dispatcher";
import { SideEnter } from "../contents/activate-position-generator/side-enter";
import { ActivatePositionGenerator } from "./activate-position-generator";
import {
  StaticEnemyMoverCreator,
  EnemyMoveRouteType
} from "./static-enemy-mover-creator";
import { TopEnter } from "../contents/activate-position-generator/top-enter";
import { TopWideEnter } from "../contents/activate-position-generator/top-wide-enter";

export enum EnemyMoveType {
  sideIn = "sideIn",
  topIn = "topIn",
  topWideIn = "topWideIn"
}

export interface EnemyInfo {
  texturePath: string;
  textureSizeInArea: ex.Vector;
  muzzleCreator: MuzzleCreator;
  weaponCreator: WeaponCreator;
  killTime: number;
  sizeInArea: ex.Vector;
  isSmallSize: boolean;
  moveSpeedInArea: number;
}

export interface SquadInfo {
  enemyInfoId: number;
  moveType: EnemyMoveType;
  activateInOtherSideOfPlayer: boolean;
  overTime: number;
  killTime: number;
  activateTime: number;
}

export interface StageEnemyCreatorArgs {
  scene: ex.Scene;
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  playerDPS: number;
  moveTime: number;
  enemyInfo: Map<number, EnemyInfo>;
  squadInfo: SquadInfo[];
}

export class StageEnemyCreator {
  private readonly scene: ex.Scene;
  private readonly collisions: Collisions;
  private readonly coordinatesConverter: CoordinatesConverter;
  private readonly playerDPS: number;
  private readonly moveTime: number;
  private readonly squadInfo: SquadInfo[];
  private readonly enemyInfo: Map<number, EnemyInfo>;
  private readonly enemyCreators: Map<number, EnemyCreator>;
  private readonly spawnNum: number[];

  public constructor(args: StageEnemyCreatorArgs) {
    this.scene = args.scene;
    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;
    this.playerDPS = args.playerDPS;
    this.moveTime = args.moveTime;
    this.squadInfo = args.squadInfo;
    this.enemyInfo = args.enemyInfo;

    const ecMap = new Map();
    for (const [key, enInfo] of args.enemyInfo) {
      ecMap.set(key, this.createEnemyCreator(enInfo));
    }
    this.enemyCreators = ecMap;

    this.spawnNum = args.squadInfo.map((sqInfo: SquadInfo): number => {
      const enInfo = args.enemyInfo.get(sqInfo.enemyInfoId);
      if (enInfo === undefined) throw new Error("Squad using unknown enemy");
      return this.calcSpawnNum(sqInfo, enInfo);
    });
  }

  public create(playerStartFromLeft: boolean): SquadBuilderStarter {
    let prevFinishTime = 0;
    let playerIsInLeftSide = playerStartFromLeft;
    const builderInfo = this.squadInfo.map(
      (sqInfo: SquadInfo, index: number): SquadBuilderInfo => {
        const timeBeforePrevSquadFinished =
          sqInfo.activateTime + sqInfo.overTime;
        const startTime = prevFinishTime - timeBeforePrevSquadFinished;
        const enemyIsInLeft = sqInfo.activateInOtherSideOfPlayer
          ? !playerIsInLeftSide
          : playerIsInLeftSide;

        const ec = this.enemyCreators.get(sqInfo.enemyInfoId);
        const ei = this.enemyInfo.get(sqInfo.enemyInfoId);
        if (ec === undefined || ei === undefined)
          throw new Error("Squad using unknown enemy");

        const posGen = this.createActivatePositionGenerator(
          ei,
          sqInfo.moveType
        );
        const moverCreator = this.createMoverCreator(
          sqInfo,
          ei,
          sqInfo.moveType,
          enemyIsInLeft
        );
        const activateTimeAndPositions = posGen.generate(
          this.spawnNum[index],
          ei.killTime,
          ei.sizeInArea,
          sqInfo.killTime,
          enemyIsInLeft
        );
        const squad = new Squad(new EventDispatcher<SquadFinishedReason>());
        const squadBuilder = new SquadBuilder({
          squad,
          scene: this.scene,
          onFinished: new EventDispatcher<void>(),
          enemyCreator: ec,
          moverCreator,
          activateTimeAndPositions,
          activateTime: sqInfo.activateTime
        });

        const moveTime = sqInfo.activateInOtherSideOfPlayer ? this.moveTime : 0;
        const timeAfterPrevSquadFinished = moveTime + sqInfo.killTime;
        prevFinishTime += timeAfterPrevSquadFinished;
        playerIsInLeftSide = posGen.playerIsInLeftWhenEnemiesFinished(
          playerIsInLeftSide,
          enemyIsInLeft
        );
        return {
          startTime,
          squad,
          squadBuilder
        };
      }
    );
    builderInfo.sort((a, b) => {
      return a.startTime - b.startTime;
    });
    const startTimeOffset = builderInfo[0].startTime;
    for (const info of builderInfo) {
      info.startTime -= startTimeOffset;
    }
    return new SquadBuilderStarter({
      builderInfo,
      onFinished: new EventDispatcher()
    });
  }

  private createEnemyCreator(info: EnemyInfo): EnemyCreator {
    return new EnemyCreator({
      texturePath: info.texturePath,
      textureSizeInArea: info.textureSizeInArea,
      collisions: this.collisions,
      coordinatesConverter: this.coordinatesConverter,
      health: info.killTime * this.playerDPS,
      muzzleCreator: info.muzzleCreator,
      weaponCreator: info.weaponCreator,
      sizeInArea: info.sizeInArea
    });
  }

  private calcSpawnNum(sqInfo: SquadInfo, enInfo: EnemyInfo): number {
    return Math.max(1, Math.floor(sqInfo.killTime / enInfo.killTime));
  }

  private createActivatePositionGenerator(
    _info: EnemyInfo,
    moveType: EnemyMoveType
  ): ActivatePositionGenerator {
    if (moveType === EnemyMoveType.sideIn) return new SideEnter();
    if (moveType === EnemyMoveType.topIn) return new TopEnter();
    if (moveType === EnemyMoveType.topWideIn) return new TopWideEnter();
    throw new Error("Unknown move type");
  }

  private createMoverCreator(
    sqInfo: SquadInfo,
    enInfo: EnemyInfo,
    moveType: EnemyMoveType,
    isLeftSide: boolean
  ): StaticEnemyMoverCreator {
    const routeType =
      moveType === EnemyMoveType.sideIn
        ? EnemyMoveRouteType.sideMove
        : EnemyMoveRouteType.drop;
    return new StaticEnemyMoverCreator({
      routeType,
      activateTime: sqInfo.activateTime,
      isLeftSide,
      moveSpeedInArea: enInfo.moveSpeedInArea
    });
  }
}
