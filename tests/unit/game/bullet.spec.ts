import * as ex from "excalibur";
import { Bullet } from "@/game/bullet";
import { simpleMock } from "../../test-util";
import { createCollisionsMock, createSceneMock } from "./test-game-util";
import { Character } from "@/game/character";
import { HealthComponent } from "@/game/health-component";
import { ZIndex } from "@/game/z-index";

describe("Bullet", (): void => {
  it("must be initialized with pos, rotation, speed and isPlayerSide", (): void => {
    // Given Bullet
    const bullet = new Bullet({
      collisions: simpleMock()
    });
    bullet.scene = createSceneMock();

    // When initialize bullet
    // Then error was not thrown
    const initArgs = {
      damage: 1,
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    expect((): void => bullet.init(initArgs)).not.toThrowError();
  });

  it("unkilled if killed when initialized", (): void => {
    // Given killed Bullet
    const bullet = new Bullet({
      collisions: simpleMock()
    });
    bullet.scene = createSceneMock();
    bullet.unkill = jest.fn();
    bullet.kill();

    // When initialize bullet
    const initArgs = {
      damage: 1,
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    bullet.init(initArgs);

    // Then bullet was unkilled
    expect(bullet.unkill).toBeCalled();
  });

  it.each`
    isPlayerSide | collisionName
    ${true}      | ${"playerBullet"}
    ${false}     | ${"enemyBullet"}
  `(
    "set collision as playerBullet if isPlayerSide",
    ({ isPlayerSide, collisionName }): void => {
      // Given collisions
      const collisions = createCollisionsMock();

      // And Bullet
      const bullet = new Bullet({
        collisions
      });
      bullet.scene = createSceneMock();

      // And initialize bullet
      const initArgs = {
        damage: 1,
        pos: new ex.Vector(3, 5),
        isPlayerSide,
        rotation: 0,
        speed: 1
      };
      bullet.init(initArgs);

      // Then bullet was set collision
      const expectedCollision =
        collisionName === "playerBullet"
          ? collisions.playerBullet
          : collisions.enemyBullet;
      expect(bullet.body.collider.group).toBe(expectedCollision);
    }
  );

  it("take damage when hit to character", (): void => {
    // Given Bullet
    const bulletIsPlayerSide = true;
    const bullet = new Bullet({
      collisions: simpleMock()
    });
    bullet.scene = createSceneMock();

    // And Character
    const healthComponent = simpleMock<HealthComponent>();
    healthComponent.takeDamage = jest.fn();
    const character = simpleMock<Character>({
      health: healthComponent,
      isPlayerSide: !bulletIsPlayerSide
    });

    // When initialize bullet
    const damage = 10;
    const initArgs = {
      damage,
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: bulletIsPlayerSide
    };
    bullet.init(initArgs);

    // When bullet hits to character
    bullet.hitTo(character);

    // Then character was damaged
    expect(character.health.takeDamage).toBeCalledWith(damage);
  });

  it.each`
    isPlayerSide | zIndex
    ${true}      | ${ZIndex.playerBullet}
    ${false}     | ${ZIndex.enemyBullet}
  `("set Z-Index when initialized", ({ isPlayerSide, zIndex }): void => {
    // Given Bullet
    const bullet = new Bullet({
      collisions: createCollisionsMock()
    });
    bullet.scene = createSceneMock();
    bullet.setZIndex = jest.fn();

    // And initialize bullet
    const initArgs = {
      isPlayerSide,
      damage: 1,
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1
    };
    bullet.init(initArgs);

    // Then bullet z was set
    expect(bullet.setZIndex).toBeCalledWith(zIndex);
  });
});
