import * as ex from "excalibur";
import { Bullet } from "@/game/weapon/bullet";
import { simpleMock } from "../../../test-util";
import { createCollisionsMock } from "../test-game-util";
import { Character } from "@/game/actor/character";
import { ZIndex } from "@/game/common/z-index";
import { ExtendedActor } from "@/game/actor/extended-actor";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";

function createCoordinatesConverterMock(): CoordinatesConverter {
  const cc = new CoordinatesConverter({
    areaSizeInCanvas: 1,
    visualAreaSizeInCanvas: { x: 2, y: 2 },
    centerInCanvas: { x: 1, y: 1 }
  });
  return cc;
}

function createActorMock(): ExtendedActor {
  return simpleMock<ExtendedActor>({
    coordinatesConverter: createCoordinatesConverterMock(),
    kill: jest.fn(),
    isKilled: jest.fn().mockReturnValue(false),
    unkill: jest.fn(),
    update: jest.fn(),
    setCollision: jest.fn(),
    collisions: createCollisionsMock(),
    setZIndex: jest.fn(),
    on: jest.fn(),
    moveToPosInArea: jest.fn()
  });
}

function createEnemyCharacterMock(isPlayerSide: boolean): Character {
  return simpleMock<Character>({
    isPlayerSide,
    takeDamage: jest.fn()
  });
}

describe("Bullet", (): void => {
  it("must be initialized with pos, rotation, speed and isPlayerSide", (): void => {
    // Given Bullet
    const bullet = new Bullet(createActorMock());

    // Then can initialize bullet
    const initArgs = {
      damage: 1,
      posInArea: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    expect((): void => bullet.init(initArgs)).not.toThrowError();
  });

  it("unkilled if killed when initialized", (): void => {
    // Given killed Actor
    const actor = createActorMock();
    actor.isKilled = jest.fn().mockReturnValueOnce(true);

    // And Bullet
    const bullet = new Bullet(actor);

    // When initialize bullet
    const initArgs = {
      damage: 1,
      posInArea: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    bullet.init(initArgs);

    // Then actor was unkilled
    expect(bullet.actor.unkill).toBeCalled();
  });

  it.each`
    isPlayerSide | collisionName
    ${true}      | ${"playerBullet"}
    ${false}     | ${"enemyBullet"}
  `(
    "set collision as playerBullet if isPlayerSide",
    ({ isPlayerSide, collisionName }): void => {
      // Given Bullet
      const bullet = new Bullet(createActorMock());

      // And initialize bullet
      const initArgs = {
        damage: 1,
        posInArea: new ex.Vector(3, 5),
        isPlayerSide,
        rotation: 0,
        speed: 1
      };
      bullet.init(initArgs);

      // Then bullet was set collision
      const cols = bullet.actor.collisions;
      const collisionNameTyped = collisionName as
        | "playerBullet"
        | "enemyBullet";
      const expectedCollision = cols[collisionNameTyped];
      expect(bullet.actor.setCollision).toBeCalledWith(expectedCollision);
    }
  );

  it("take damage when hit to character", (): void => {
    // Given Bullet
    const bulletIsPlayerSide = true;
    const bullet = new Bullet(createActorMock());

    // And Character
    const character = createEnemyCharacterMock(!bulletIsPlayerSide);

    // When initialize bullet
    const damage = 10;
    const initArgs = {
      damage,
      posInArea: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: bulletIsPlayerSide
    };
    bullet.init(initArgs);

    // When bullet hits to character
    bullet.hitTo(character);

    // Then character was damaged
    expect(character.takeDamage).toBeCalledWith(damage);
  });

  it.each`
    isPlayerSide | zIndex
    ${true}      | ${ZIndex.playerBullet}
    ${false}     | ${ZIndex.enemyBullet}
  `("set Z-Index when initialized", ({ isPlayerSide, zIndex }): void => {
    // Given Bullet
    const bullet = new Bullet(createActorMock());

    // And initialize bullet
    const initArgs = {
      isPlayerSide,
      damage: 1,
      posInArea: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1
    };
    bullet.init(initArgs);

    // Then bullet z was set
    expect(bullet.actor.setZIndex).toBeCalledWith(zIndex);
  });
});
