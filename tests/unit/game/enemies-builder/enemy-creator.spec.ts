import * as ex from "excalibur";
import { Character } from "@/game/actor/character";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";
import { createCollisionsMock } from "../test-game-util";
import { simpleMock } from "../../../test-util";
import { WeaponCreator } from "@/game/enemies-builder/weapon-creator";
import {
  EnemyCreator,
  EnemyCreatorArgs
} from "@/game/enemies-builder/enemy-creator";
import { MuzzleCreator } from "@/game/enemies-builder/muzzle-creator";
import { Mover } from "@/game/mover/mover";

function createMoverMock(): Mover {
  return simpleMock<Mover>({
    onEnteringToArea: jest.fn(),
    onExitingFromArea: jest.fn()
  });
}

function createEnemyCreatorArgs(): EnemyCreatorArgs {
  return {
    collisions: createCollisionsMock(),
    coordinatesConverter: simpleMock<CoordinatesConverter>(),
    health: 100,
    muzzleCreator: simpleMock<MuzzleCreator>({
      create: jest.fn()
    }),
    weaponCreator: simpleMock<WeaponCreator>({
      create: jest.fn()
    }),
    sizeInArea: new ex.Vector(0.25, 0.25)
  };
}

describe("EnemyCreator", (): void => {
  it("can create character without scene", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const mover = createMoverMock();
    const createdEnemy = ec.create(mover);

    // Then created enemy was added to scene
    expect(createdEnemy).toBeInstanceOf(Character);
  });

  it("create character as enemy", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const mover = createMoverMock();
    const createdEnemy = ec.create(mover);

    // Then created enemy is not player side
    expect(createdEnemy.isPlayerSide()).toBe(false);
  });

  it("create character with muzzle", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const mover = createMoverMock();
    const createdEnemy = ec.create(mover);

    // Then created enemy with muzzle
    expect(args.muzzleCreator.create).toBeCalledWith(createdEnemy.actor);
  });

  it("create character with weapon", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const mover = createMoverMock();
    const _createdEnemy = ec.create(mover);

    // Then created enemy with weapon
    expect(args.weaponCreator.create).toBeCalled();
  });
});
