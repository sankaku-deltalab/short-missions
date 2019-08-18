import { simpleMock } from "../../test-util";
import { Weapon } from "@/game/weapon";
import { Character } from "@/game/character";
import { createCollisionsMock } from "./test-game-util";
import { HealthComponent } from "@/game/health-component";
import { ExtendedActor } from "@/game/extended-actor";

function createHealthComponentMock(): HealthComponent {
  return new HealthComponent(10, 10);
}

function createActorMock(): ExtendedActor {
  return simpleMock<ExtendedActor>({
    on: jest.fn(),
    collisions: createCollisionsMock(),
    setCollision: jest.fn(),
    kill: jest.fn(),
    update: jest.fn()
  });
}

describe("Character", (): void => {
  it("can set weapon", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();

    // And Character
    const character = new Character({
      isPlayerSide: true,
      health: createHealthComponentMock(),
      actor: createActorMock()
    });

    // When set weapon
    character.setWeapon(weapon);

    // Then weapon was set
    expect(character.weapon).toBe(weapon);
  });

  it("throw error if set weapon twice", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();

    // And Character
    const character = new Character({
      isPlayerSide: true,
      health: createHealthComponentMock(),
      actor: createActorMock()
    });

    // When set weapon
    character.setWeapon(weapon);

    // And set weapon again
    const nextWeapon = simpleMock<Weapon>();
    const func = (): void => {
      character.setWeapon(nextWeapon);
    };

    // Then throw error
    expect(func).toThrowError();
  });

  it("tick weapon when updated", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();
    weapon.tick = jest.fn();

    // And Character
    const character = new Character({
      isPlayerSide: true,
      health: createHealthComponentMock(),
      actor: createActorMock()
    });

    // When set weapon
    character.setWeapon(weapon);

    // And update Character
    const engine = simpleMock<ex.Engine>();
    const deltaTime = 3;
    character.update(engine, deltaTime);

    // Then weapon was ticked
    expect(weapon.tick).toBeCalledWith(deltaTime);
  });

  it("stop weapon immediately when killed", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();
    weapon.stopFiring = jest.fn();

    // And Character
    const character = new Character({
      isPlayerSide: true,
      health: createHealthComponentMock(),
      actor: createActorMock()
    });

    // When set weapon
    character.setWeapon(weapon);

    // And Character was killed
    character.kill();

    // Then weapon was ticked
    expect(weapon.stopFiring).toBeCalledWith(true);
  });

  it.each`
    isPlayerSide | collisionName
    ${true}      | ${"player"}
    ${false}     | ${"enemy"}
  `(
    "set collision as player if isPlayerSide",
    ({ isPlayerSide, collisionName }): void => {
      // Given collisions
      const actor = createActorMock();
      const collisions = actor.collisions;

      // When create Character
      const _character = new Character({
        isPlayerSide,
        actor,
        health: createHealthComponentMock()
      });

      // Then character was set collision
      const collisionNameTyped = collisionName as "player" | "enemy";
      const expectedCollision = collisions[collisionNameTyped];
      expect(actor.setCollision).toBeCalledWith(expectedCollision);
    }
  );

  it("killed when health was died", (): void => {
    // Given healthComponent
    const health = new HealthComponent(10, 10);

    // And Character
    const character = new Character({
      health,
      isPlayerSide: true,
      actor: createActorMock()
    });
    character.kill = jest.fn();

    // When health was died
    character.health.die();

    // Then character was killed
    expect(character.kill).toBeCalled();
  });

  it("kill actor when killed", (): void => {
    // Given Character
    const character = new Character({
      isPlayerSide: true,
      actor: createActorMock(),
      health: createHealthComponentMock()
    });

    // When kill Character
    character.kill();

    // Then actor was killed
    expect(character.actor.kill).toBeCalled();
  });

  it("don't update actor when updated", (): void => {
    // Given Character
    const character = new Character({
      isPlayerSide: true,
      actor: createActorMock(),
      health: createHealthComponentMock()
    });

    // When update Character directory
    character.update(simpleMock(), 10);

    // Then actor was not updated
    expect(character.actor.update).not.toBeCalled();
  });
});
