import * as ex from "excalibur";
import * as gt from "guntree";
import * as mat from "transformation-matrix";
import { simpleMock } from "../../test-util";
import { Muzzle } from "@/game/muzzle";
import { BulletsPool } from "@/game/bullets-pool";
import { Bullet } from "@/game/bullet";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { ExtendedActor } from "@/game/extended-actor";

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
  const scene = simpleMock<ex.Scene>({
    add: jest.fn()
  });
  return scene;
}

function createActorMock(): ExtendedActor {
  return simpleMock<ExtendedActor>({
    coordinatesConverter: createCoordinatesConverterMock(),
    kill: jest.fn(),
    update: jest.fn()
  });
}

function createBulletMock(): Bullet {
  return simpleMock<Bullet>({
    init: jest.fn(),
    actor: jest.fn()
  });
}

describe("Muzzle", (): void => {
  it("use bullet poped from pool", (): void => {
    // Given BulletsPool
    const bullet = createBulletMock();
    const bulletsPool = simpleMock<BulletsPool>();
    bulletsPool.pop = jest.fn().mockReturnValueOnce(bullet);

    // And Muzzle in scene
    const muzzle = new Muzzle({
      damage: 1,
      bulletsPool,
      isPlayerSide: true,
      actor: createActorMock()
    });
    muzzle.actor.scene = createSceneMock();

    // When fire from muzzle
    const data = createFireDataMock();
    muzzle.fire(data, simpleMock());

    // Then bullet in pool was used
    expect(bullet.init).toBeCalled();
  });

  it("init bullets with damage", (): void => {
    // Given BulletsPool
    const bullet = createBulletMock();
    const bulletsPool = simpleMock<BulletsPool>();
    bulletsPool.pop = jest.fn().mockReturnValueOnce(bullet);

    // And Muzzle in scene
    const damage = 10;
    const muzzle = new Muzzle({
      damage,
      bulletsPool,
      isPlayerSide: true,
      actor: createActorMock()
    });
    muzzle.actor.scene = createSceneMock();

    // When fire from muzzle
    const data = createFireDataMock();
    muzzle.fire(data, simpleMock());

    // Then bullet with initialized with muzzle damage
    expect((bullet.init as jest.Mock).mock.calls[0][0].damage).toBe(damage);
  });

  it("kill actor when killed", (): void => {
    // Given Muzzle
    const muzzle = new Muzzle({
      damage: 10,
      bulletsPool: simpleMock<BulletsPool>(),
      isPlayerSide: true,
      actor: createActorMock()
    });

    // When kill muzzle
    muzzle.kill();

    // Then actor was killed
    expect(muzzle.actor.kill).toBeCalled();
  });

  it("don't update actor when updated", (): void => {
    // Given Muzzle
    const muzzle = new Muzzle({
      damage: 10,
      bulletsPool: simpleMock<BulletsPool>(),
      isPlayerSide: true,
      actor: createActorMock()
    });

    // When update Muzzle directory
    muzzle.update(simpleMock(), 10);

    // Then actor was not updated
    expect(muzzle.actor.update).not.toBeCalled();
  });

  it("add actor to scene when initialized", (): void => {
    // Given BulletsPool
    const bullet = createBulletMock();
    const bulletsPool = simpleMock<BulletsPool>({
      pop: jest.fn().mockReturnValueOnce(bullet)
    });

    // And Muzzle in scene
    const muzzle = new Muzzle({
      damage: 1,
      bulletsPool,
      isPlayerSide: true,
      actor: createActorMock()
    });
    muzzle.actor.scene = createSceneMock();

    // When fire from muzzle
    muzzle.fire(createFireDataMock(), simpleMock());

    // Then bullet actor was added to muzzle's scene
    expect(muzzle.actor.scene.add).toBeCalledWith(bullet.actor);
  });
});
