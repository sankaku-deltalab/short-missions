import * as ex from "excalibur";
import { simpleMock } from "../../../test-util";
import {
  SquadBuilder,
  SquadBuilderArgs
} from "@/game/enemies-builder/squad-builder";
import { Squad } from "@/game/enemies-builder/squad";
import { createSceneMock } from "../test-game-util";
import { EventDispatcher } from "@/game/common/event-dispatcher";
import { EnemyCreator } from "@/game/enemies-builder/enemy-creator";
import { StaticEnemyMoverCreator } from "@/game/enemies-builder/static-enemy-mover-creator";
import { Character } from "@/game/actor/character";
import { ExtendedActor } from "@/game/actor/extended-actor";
import { Mover } from "@/game/mover/mover";
import { ZIndex } from "@/game/common/z-index";

function createSquadMock(): Squad {
  return simpleMock<Squad>({
    add: jest.fn(),
    notifyFinishSpawning: jest.fn()
  });
}

function createEnemyMock(): Character {
  const actor = simpleMock<ExtendedActor>({
    setZIndex: jest.fn(),
    children: [
      simpleMock<ExtendedActor>(),
      simpleMock<ExtendedActor>(),
      simpleMock<ExtendedActor>()
    ]
  });
  return simpleMock<Character>({
    actor,
    onDied: jest.fn(),
    onExitingFromArea: jest.fn(),
    startMoving: jest.fn()
  });
}

function createEnemyCreatorMock(): EnemyCreator {
  return simpleMock<EnemyCreator>({
    create: jest.fn().mockImplementation(createEnemyMock)
  });
}

function createMoverMock(): Mover {
  return simpleMock<Mover>({
    onEnteringToArea: new EventDispatcher<void>(),
    onExitingFromArea: new EventDispatcher<void>()
  });
}

function createSquadBuilderArgsMock(): SquadBuilderArgs {
  return {
    squad: createSquadMock(),
    scene: createSceneMock(),
    onFinished: new EventDispatcher(),
    enemyCreator: createEnemyCreatorMock(),
    moverCreator: simpleMock<StaticEnemyMoverCreator>({
      create: jest.fn().mockImplementation(createMoverMock)
    }),
    activateTimeAndPositions: [{ timeSec: 0, position: new ex.Vector(1, 2) }],
    activateTime: 1
  };
}

describe("SquadBuilder", (): void => {
  it("spawn first enemy when started", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy = createEnemyMock();
    args.enemyCreator.create = jest.fn().mockReturnValueOnce(enemy);
    const mover = createMoverMock();
    args.moverCreator.create = jest.fn().mockReturnValueOnce(mover);
    const activatePos = new ex.Vector(1, 2);
    args.activateTimeAndPositions = [{ timeSec: 0, position: activatePos }];
    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // Then mover was created from moverCreator
    expect(args.moverCreator.create).toBeCalledWith(activatePos);

    // And mover was used for EnemyCreator
    expect(args.enemyCreator.create).toBeCalledWith(mover);

    // And created enemy was added to scene
    expect(args.scene.add).toBeCalledWith(enemy.actor);

    // And children of created enemy was added to scene
    for (const child of enemy.actor.children) {
      expect(args.scene.add).toBeCalledWith(child);
    }
  });

  it("spawn second enemy when updated with enough time", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy1 = createEnemyMock();
    const enemy2 = createEnemyMock();
    args.enemyCreator.create = jest
      .fn()
      .mockReturnValueOnce(enemy1)
      .mockReturnValueOnce(enemy2);
    const durationMS = 500;
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) },
      { timeSec: durationMS / 1000, position: new ex.Vector(1, 2) }
    ];

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(durationMS);

    // Then building squad was dealt
    expect(args.enemyCreator.create).toBeCalledTimes(2);
    expect(args.scene.add).toBeCalledWith(enemy2.actor);
  });

  it("spawning enemy count is same of activate positions num", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy1 = createEnemyMock();
    args.enemyCreator.create = jest.fn().mockReturnValue(enemy1);
    const durationMS = 500;
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) },
      { timeSec: durationMS / 1000, position: new ex.Vector(1, 2) }
    ];

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(durationMS * args.activateTimeAndPositions.length * 20);

    // Then building squad was dealt
    expect(args.enemyCreator.create).toBeCalledTimes(2);
  });

  it("start spawned enemy mover", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy1 = createEnemyMock();
    const enemy2 = createEnemyMock();
    args.enemyCreator.create = jest
      .fn()
      .mockReturnValueOnce(enemy1)
      .mockReturnValueOnce(enemy2);
    const durationMS = 500;
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) },
      { timeSec: durationMS / 1000, position: new ex.Vector(1, 2) }
    ];

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(durationMS);

    // Then spawned enemy was started mover
    expect(args.enemyCreator.create).toBeCalledTimes(2);
    expect(enemy1.startMoving).toBeCalled();
    expect(enemy2.startMoving).toBeCalled();
  });

  it("dispatch event when finish spawning", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const durationMS = 500;
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) },
      { timeSec: durationMS / 1000, position: new ex.Vector(1, 2) }
    ];
    args.onFinished = simpleMock<EventDispatcher<void>>({
      dispatch: jest.fn()
    });

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time for full spawning
    for (const timeAndPos of args.activateTimeAndPositions) {
      squadBuilder.update(timeAndPos.timeSec * 1000);
    }

    // Then onFinished event was called
    expect(args.onFinished.dispatch).toBeCalled();
  });

  it("notify finish spawning to squad", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const durationMS = 500;
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) },
      { timeSec: durationMS / 1000, position: new ex.Vector(1, 2) }
    ];
    args.onFinished = simpleMock<EventDispatcher<void>>({
      dispatch: jest.fn()
    });

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time for full spawning
    for (const timeAndPos of args.activateTimeAndPositions) {
      squadBuilder.update(timeAndPos.timeSec * 1000);
    }

    // Then notify finish spawning to squad
    expect(args.squad.notifyFinishSpawning).toBeCalled();
  });

  it("set Z-Index as enemy", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy1 = createEnemyMock();
    args.enemyCreator.create = jest.fn().mockReturnValueOnce(enemy1);
    args.activateTimeAndPositions = [
      { timeSec: 0, position: new ex.Vector(1, 2) }
    ];

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // Then spawned enemy was set Z-Index
    expect(enemy1.actor.setZIndex).toBeCalledWith(ZIndex.enemy);
  });
});
