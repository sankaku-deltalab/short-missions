import * as ex from "excalibur";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { createCollisionsMock } from "./test-game-util";
import { simpleMock } from "../../test-util";
import { MuzzleCreatorArgs, MuzzleCreator } from "@/game/muzzle-creator";
import { BulletsPool } from "@/game/bullets-pool";
import { Muzzle } from "@/game/muzzle";

function createCoordinatesConverterMock(): CoordinatesConverter {
  const cc = new CoordinatesConverter({
    areaSizeInCanvas: 1,
    visualAreaSizeInCanvas: { x: 2, y: 2 },
    centerInCanvas: { x: 1, y: 1 }
  });
  return cc;
}

function createMuzzleCreatorArgs(): MuzzleCreatorArgs {
  return {
    collisions: createCollisionsMock(),
    coordinatesConverter: createCoordinatesConverterMock(),
    isPlayerSide: true,
    muzzleInfoList: [
      {
        name: "centerMuzzle",
        offsetInArea: new ex.Vector(0.1, 0),
        damage: 10,
        bulletsPool: simpleMock<BulletsPool>()
      }
    ]
  };
}

describe("MuzzleCreator", (): void => {
  it("can create muzzles without scene", (): void => {
    // Give EnemyCreator
    const args = createMuzzleCreatorArgs();
    args.muzzleInfoList = [
      {
        name: "centerMuzzle",
        offsetInArea: new ex.Vector(0.1, 0),
        damage: 10,
        bulletsPool: simpleMock<BulletsPool>()
      }
    ];
    const mc = new MuzzleCreator(args);

    // And owner actor
    const owner = simpleMock<ex.Actor>({
      add: jest.fn()
    });

    // When create enemy
    const createdMuzzles = mc.create(owner);

    // Then created enemy was added to scene
    for (const [name, muzzle] of Object.entries(createdMuzzles)) {
      expect(name).toBe("centerMuzzle");
      expect(muzzle).toBeInstanceOf(Muzzle);
    }
  });

  it("add created muzzles to owner", (): void => {
    // Give EnemyCreator
    const args = createMuzzleCreatorArgs();
    args.muzzleInfoList = [
      {
        name: "centerMuzzle",
        offsetInArea: new ex.Vector(0.1, 0),
        damage: 10,
        bulletsPool: simpleMock<BulletsPool>()
      }
    ];
    const mc = new MuzzleCreator(args);

    // And owner actor
    const owner = simpleMock<ex.Actor>({
      add: jest.fn()
    });

    // When create enemy
    const createdMuzzles = mc.create(owner);

    // Then created enemy was added to scene
    for (const [_name, muzzle] of Object.entries(createdMuzzles)) {
      expect(owner.add).toBeCalledWith(muzzle.actor);
    }
  });
});
