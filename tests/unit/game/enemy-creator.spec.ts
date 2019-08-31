import * as ex from "excalibur";
import { Character } from "@/game/character";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { createCollisionsMock } from "./test-game-util";
import { simpleMock } from "../../test-util";
import { WeaponCreator } from "@/game/weapon-creator";
import { EnemyCreator, EnemyCreatorArgs } from "@/game/enemy-creator";
import { MuzzleCreator } from "@/game/muzzle-creator";

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
    const createdEnemy = ec.create();

    // Then created enemy was added to scene
    expect(createdEnemy).toBeInstanceOf(Character);
  });

  it("create character as enemy", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const createdEnemy = ec.create();

    // Then created enemy is not player side
    expect(createdEnemy.isPlayerSide).toBe(false);
  });

  it("create character with muzzle", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const createdEnemy = ec.create();

    // Then created enemy with muzzle
    expect(args.muzzleCreator.create).toBeCalledWith(createdEnemy.actor);
  });

  it("create character with weapon", (): void => {
    // Give EnemyCreator
    const args = createEnemyCreatorArgs();
    const ec = new EnemyCreator(args);

    // When create enemy
    const _createdEnemy = ec.create();

    // Then created enemy with weapon
    expect(args.weaponCreator.create).toBeCalled();
  });
});
