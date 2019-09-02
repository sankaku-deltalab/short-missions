import * as ex from "excalibur";
import { simpleMock } from "../../test-util";
import { SquadBuilder, SquadBuilderArgs } from "@/game/squad-builder";
import { Squad } from "@/game/squad";
import { createSceneMock } from "./test-game-util";
import { EventDispatcher } from "@/game/event-dispatcher";
import { EnemyCreator } from "@/game/enemy-creator";
import { Character } from "@/game/character";
import { ExtendedActor } from "@/game/extended-actor";
import { HealthComponent } from "@/game/health-component";
import { Mover } from "@/game/mover";

function createSquadMock(): Squad {
  return simpleMock<Squad>({
    add: jest.fn(),
    notifyFinishSpawning: jest.fn()
  });
}

function createEnemyMock(): Character {
  const actor = simpleMock<ExtendedActor>({
    children: [
      simpleMock<ExtendedActor>(),
      simpleMock<ExtendedActor>(),
      simpleMock<ExtendedActor>()
    ]
  });
  const health = simpleMock<HealthComponent>({
    onDied: new EventDispatcher<void>()
  });
  const mover = simpleMock<Mover>({
    onExitingFromArea: new EventDispatcher<void>()
  });
  return simpleMock<Character>({
    actor,
    health,
    mover,
    startMover: jest.fn()
  });
}

function createEnemyCreatorMock(): EnemyCreator {
  return simpleMock<EnemyCreator>({
    create: jest.fn().mockImplementation(createEnemyMock)
  });
}

function createSquadBuilderArgsMock(): SquadBuilderArgs {
  return {
    squad: createSquadMock(),
    scene: createSceneMock(),
    onFinished: new EventDispatcher(),
    enemyCreator: createEnemyCreatorMock(),
    activatePositions: [new ex.Vector(1, 2)],
    spawnDurationMS: 100
  };
}

describe("SquadBuilder", (): void => {
  it("spawn first enemy when started", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy = createEnemyMock();
    args.enemyCreator.create = jest.fn().mockReturnValueOnce(enemy);
    const activatePos = new ex.Vector(1, 2);
    args.activatePositions = [activatePos];

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // Then character was created from EnemyCreator
    expect(args.enemyCreator.create).toBeCalledWith(activatePos);

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
    args.activatePositions = [new ex.Vector(1, 2), new ex.Vector(1, 2)];
    args.spawnDurationMS = 100;

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(args.spawnDurationMS);

    // Then building squad was dealt
    expect(args.enemyCreator.create).toBeCalledTimes(2);
    expect(args.scene.add).toBeCalledWith(enemy2.actor);
  });

  it("spawning enemy count is same of activate positions num", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    const enemy1 = createEnemyMock();
    args.enemyCreator.create = jest.fn().mockReturnValue(enemy1);
    args.activatePositions = [new ex.Vector(1, 2), new ex.Vector(1, 2)];
    args.spawnDurationMS = 100;

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(
      args.spawnDurationMS * args.activatePositions.length * 20
    );

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
    args.activatePositions = [new ex.Vector(1, 2), new ex.Vector(1, 2)];
    args.spawnDurationMS = 100;

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time
    squadBuilder.update(args.spawnDurationMS);

    // Then spawned enemy was started mover
    expect(args.enemyCreator.create).toBeCalledTimes(2);
    expect(enemy1.startMover).toBeCalled();
    expect(enemy2.startMover).toBeCalled();
  });

  it("dispatch event when finish spawning", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    args.spawnDurationMS = 100;
    args.activatePositions = [new ex.Vector(1, 1), new ex.Vector(2, 2)];
    args.onFinished = simpleMock<EventDispatcher<void>>({
      dispatch: jest.fn()
    });

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time for full spawning
    for (const _ of Array(args.activatePositions.length - 1)) {
      squadBuilder.update(args.spawnDurationMS);
    }

    // Then onFinished event was called
    expect(args.onFinished.dispatch).toBeCalled();
  });

  it("notify finish spawning to squad", (): void => {
    // Given SquadBuilder
    const args = createSquadBuilderArgsMock();
    args.spawnDurationMS = 100;
    args.activatePositions = [new ex.Vector(1, 1), new ex.Vector(2, 2)];
    args.onFinished = simpleMock<EventDispatcher<void>>({
      dispatch: jest.fn()
    });

    const squadBuilder = new SquadBuilder(args);

    // When start building
    squadBuilder.start();

    // And updated with enough time for full spawning
    for (const _ of Array(args.activatePositions.length - 1)) {
      squadBuilder.update(args.spawnDurationMS);
    }

    // Then notify finish spawning to squad
    expect(args.squad.notifyFinishSpawning).toBeCalled();
  });
});
