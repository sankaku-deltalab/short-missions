import * as ex from "excalibur";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";
import { createCollisionsMock } from "../test-game-util";
import { simpleMock } from "../../../test-util";
import {
  MuzzleCreatorArgs,
  MuzzleCreator
} from "@/game/enemies-builder/muzzle-creator";
import { BulletsPool } from "@/game/weapon/bullets-pool";
import { Muzzle } from "@/game/weapon/muzzle";

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

    // When create enemy
    const createdMuzzles = mc.create();

    // Then created enemy was added to scene
    for (const [name, muzzle] of Object.entries(createdMuzzles)) {
      expect(name).toBe("centerMuzzle");
      expect(muzzle).toBeInstanceOf(Muzzle);
    }
  });
});
