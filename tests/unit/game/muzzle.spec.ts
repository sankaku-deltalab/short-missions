import * as ex from "excalibur";
import * as gt from "guntree";
import * as mat from "transformation-matrix";
import { simpleMock } from "../../test-util";
import { Muzzle } from "@/game/muzzle";
import { BulletsPool } from "@/game/bullets-pool";
import { Bullet } from "@/game/bullet";
import { CoordinatesConverter } from "@/game/coordinates-converter";

function createFireDataMock(): gt.FireData {
  const data = simpleMock<gt.FireData>();
  data.parameters = new Map([["speed", 1]]);
  data.transform = mat.translate(0);
  return data;
}

function createCoordinatesConverterMock(): CoordinatesConverter {
  const cc = new CoordinatesConverter({
    areaSizeInCanvas: 1,
    visualAreaSizeInCanvas: { x: 2, y: 2 },
    centerInCanvas: { x: 1, y: 1 }
  });
  return cc;
}

function createSceneMock(): ex.Scene {
  const scene = simpleMock<ex.Scene>();
  scene.add = jest.fn().mockImplementationOnce((actor: ex.Actor): void => {
    actor.scene = scene;
  });
  return scene;
}

describe("Muzzle", (): void => {
  it("use bullet poped from pool", (): void => {
    // Given BulletsPool
    const bullet = simpleMock<Bullet>();
    bullet.init = jest.fn();
    const bulletsPool = simpleMock<BulletsPool>();
    bulletsPool.pop = jest.fn().mockReturnValueOnce(bullet);

    // And CoordinatesConverter
    const coordinatesConverter = createCoordinatesConverterMock();

    // And Muzzle in scene
    const muzzle = new Muzzle({
      damage: 1,
      bulletsPool,
      coordinatesConverter,
      isPlayerSide: true
    });
    const scene = createSceneMock();
    scene.add(muzzle);

    // When fire from muzzle
    const data = createFireDataMock();
    muzzle.fire(data, simpleMock());

    // Then bullet in pool was used
    expect(bullet.init).toBeCalled();
  });

  it("init bullets with damage", (): void => {
    // Given BulletsPool
    const bullet = simpleMock<Bullet>();
    bullet.init = jest.fn();
    const bulletsPool = simpleMock<BulletsPool>();
    bulletsPool.pop = jest.fn().mockReturnValueOnce(bullet);

    // And CoordinatesConverter
    const coordinatesConverter = createCoordinatesConverterMock();

    // And Muzzle in scene
    const damage = 10;
    const muzzle = new Muzzle({
      damage,
      bulletsPool,
      coordinatesConverter,
      isPlayerSide: true
    });
    const scene = createSceneMock();
    scene.add(muzzle);

    // When fire from muzzle
    const data = createFireDataMock();
    muzzle.fire(data, simpleMock());

    // Then bullet with initialized with muzzle damage
    expect((bullet.init as jest.Mock).mock.calls[0][0].damage).toBe(damage);
  });
});
