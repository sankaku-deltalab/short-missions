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

export enum EnemyMoveType {
  sideIn = "sideIn"
}

export interface EnemyInfo {
  // TODO: Add visual thing
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
  changeSide: boolean;
  overTime: number;
  killTime: number;
}

export interface StageEnemyCreatorArgs {
  scene: ex.Scene;
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  playerDPS: number;
  activateTime: number;
  moveTime: number;
  enemyInfo: Map<number, EnemyInfo>;
  squadInfo: SquadInfo[];
}

export class StageEnemyCreator {
  private readonly scene: ex.Scene;
  private readonly collisions: Collisions;
  private readonly coordinatesConverter: CoordinatesConverter;
  private readonly playerDPS: number;
  private readonly activateTime: number;
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
    this.activateTime = args.activateTime;
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

  public create(startFromLeft: boolean): SquadBuilderStarter {
    let prevFinishTime = 0;
    const inLeftSide = startFromLeft;
    const builderInfo = this.squadInfo.map(
      (sqInfo: SquadInfo, index: number): SquadBuilderInfo => {
        const moveTime = sqInfo.changeSide ? this.moveTime : 0;
        const startTime = prevFinishTime - sqInfo.overTime;

        const ec = this.enemyCreators.get(sqInfo.enemyInfoId);
        const ei = this.enemyInfo.get(sqInfo.enemyInfoId);
        if (ec === undefined || ei === undefined)
          throw new Error("Squad using unknown enemy");

        const posGen = this.createActivatePositionGenerator(
          ei,
          sqInfo.moveType
        );
        const moverCreator = this.createMoverCreator(
          ei,
          sqInfo.moveType,
          inLeftSide
        );
        const activateTimeAndPositions = posGen.generate(
          this.spawnNum[index],
          ei.killTime,
          ei.sizeInArea,
          sqInfo.killTime,
          inLeftSide
        );
        const squadBuilder = new SquadBuilder({
          squad: new Squad(new EventDispatcher<SquadFinishedReason>()),
          scene: this.scene,
          onFinished: new EventDispatcher<void>(),
          enemyCreator: ec,
          moverCreator,
          activateTimeAndPositions,
          activateTime: this.activateTime
        });

        prevFinishTime += moveTime + sqInfo.killTime;
        return {
          startTime,
          squadBuilder
        };
      }
    );
    return new SquadBuilderStarter({
      builderInfo,
      onFinished: new EventDispatcher()
    });
  }

  private createEnemyCreator(info: EnemyInfo): EnemyCreator {
    return new EnemyCreator({
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
    _moveType: EnemyMoveType
  ): ActivatePositionGenerator {
    // TODO: Use more type
    return new SideEnter();
  }

  private createMoverCreator(
    info: EnemyInfo,
    _moveType: EnemyMoveType,
    isLeftSide: boolean
  ): StaticEnemyMoverCreator {
    // TODO: Use more type
    const routeType = EnemyMoveRouteType.sideMove;
    return new StaticEnemyMoverCreator({
      routeType,
      activateTime: this.activateTime,
      isLeftSide,
      moveSpeedInArea: info.moveSpeedInArea
    });
  }
}
