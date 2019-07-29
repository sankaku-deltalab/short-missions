import * as ex from "excalibur";
import { Bullet } from "@/game/bullet";
import { simpleMock } from "../../test-util";
import { createCollisionsMock } from "./test-game-util";
import { Character } from "@/game/character";
import { HealthComponent } from "@/game/health-component";

describe("Bullet", (): void => {
  it("must be initialized with pos, rotation, speed and isPlayerSide", (): void => {
    // Given Bullet
    const bullet = new Bullet({
      collisions: simpleMock()
    });

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
    // Given Bullet
    const bullet = new Bullet({
      collisions: simpleMock()
    });
    bullet.unkill = jest.fn();

    // And scene
    const scene = simpleMock<ex.Scene>();
    scene.remove = jest.fn();

    // When add bullet to scene
    bullet.scene = scene; // scene.add(bullet);

    // And kill bullet
    bullet.kill();

    // And initialize bullet
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
    bullet.scene = simpleMock<ex.Scene>({ remove: jest.fn() });

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
});
