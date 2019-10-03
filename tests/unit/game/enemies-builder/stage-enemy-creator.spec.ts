import * as ex from "excalibur";
import { simpleMock } from "../../../test-util";
import { SquadBuilderStarter } from "@/game/enemies-builder/squad-builder-starter";
import { WeaponCreator } from "@/game/enemies-builder/weapon-creator";
import {
  StageEnemyCreator,
  EnemyInfo,
  SquadInfo,
  EnemyMoveType,
  StageEnemyCreatorArgs
} from "@/game/enemies-builder/stage-enemy-creator";
import { MuzzleCreator } from "@/game/enemies-builder/muzzle-creator";
import { createSceneMock, createCollisionsMock } from "../test-game-util";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";

function createEnemyInfoMock(): EnemyInfo {
  return {
    muzzleCreator: simpleMock<MuzzleCreator>({
      create: jest.fn()
    }),
    weaponCreator: simpleMock<WeaponCreator>({
      create: jest.fn()
    }),
    killTime: 0.25,
    sizeInArea: new ex.Vector(0.125, 0.125),
    isSmallSize: false,
    moveSpeedInArea: 0.25
  };
}

function createSquadInfoMock(): SquadInfo {
  return {
    enemyInfoId: 1,
    moveType: EnemyMoveType.sideIn,
    activateInOtherSideOfPlayer: true,
    overTime: 0.25,
    killTime: 0.5,
    activateTime: 1
  };
}

function createStageEnemyCreatorArgsMock(): StageEnemyCreatorArgs {
  return {
    scene: createSceneMock(),
    collisions: createCollisionsMock(),
    coordinatesConverter: simpleMock<CoordinatesConverter>(),
    playerDPS: 100,
    moveTime: 0.5,
    enemyInfo: new Map([[1, createEnemyInfoMock()]]),
    squadInfo: [createSquadInfoMock(), createSquadInfoMock()]
  };
}

describe("StageEnemyCreator", (): void => {
  it("build SquadBuilderStarter list", (): void => {
    // Given StageEnemyCreator
    const args = createStageEnemyCreatorArgsMock();
    const seb = new StageEnemyCreator(args);

    // When build SquadBuilderStarter
    const startFromLeft = true;
    const starter = seb.create(startFromLeft);

    // Then SquadBuilderStarter was dealt
    expect(starter).toBeInstanceOf(SquadBuilderStarter);
  });
});
