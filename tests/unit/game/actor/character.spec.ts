import { simpleMock } from "../../../test-util";
import { Weapon } from "@/game/weapon/weapon";
import { Character, CharacterArgs } from "@/game/actor/character";
import { createCollisionsMock } from "../test-game-util";
import { HealthComponent } from "@/game/health-component";
import { ExtendedActor } from "@/game/actor/extended-actor";
import { Mover } from "@/game/mover/mover";

function createHealthComponentMock(): HealthComponent {
  return simpleMock<HealthComponent>({
    damageAbsorber: jest.fn(),
    health: jest.fn(),
    maxHealth: jest.fn(),
    isDead: jest.fn(),
    takeDamage: jest.fn(),
    heal: jest.fn(),
    die: jest.fn(),
    onTakeDamage: jest.fn(),
    onHealed: jest.fn(),
    onDied: jest.fn()
  });
}

function createMoverMock(): Mover {
  return simpleMock<Mover>({
    start: jest.fn(),
    update: jest.fn(),
    onEnteringToArea: jest.fn(),
    onExitingFromArea: jest.fn()
  });
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

function createCharacterArgs(): CharacterArgs {
  return {
    isPlayerSide: true,
    health: createHealthComponentMock(),
    actor: createActorMock(),
    mover: createMoverMock()
  };
}

describe("Character", (): void => {
  it("can set weapon", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();

    // And Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When set weapon
    character.setWeapon(weapon);

    // Then weapon was set
    expect(character.weapon).toBe(weapon);
  });

  it("throw error if set weapon twice", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();

    // And Character
    const args = createCharacterArgs();
    const character = new Character(args);

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
    const args = createCharacterArgs();
    const character = new Character(args);

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
    const args = createCharacterArgs();
    const character = new Character(args);

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
      const args = createCharacterArgs();
      args.isPlayerSide = isPlayerSide;
      args.actor = actor;
      const _character = new Character(args);

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
    const args = createCharacterArgs();
    args.health = health;
    const character = new Character(args);
    character.kill = jest.fn();

    // When health was died
    character.health.die();

    // Then character was killed
    expect(character.kill).toBeCalled();
  });

  it("can start owning mover", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When start mover
    character.startMover();

    // Then mover was started
    expect(args.mover.start).toBeCalledWith(character);
  });

  it("update mover if using it", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When start mover
    character.startMover();

    // And update Character
    const deltaTime = 10;
    character.update(simpleMock<ex.Engine>(), deltaTime);

    // Then mover was updated
    expect(args.mover.update).toBeCalledWith(deltaTime);
  });

  it("do not take damage before entering to area", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When take damage
    const initialHealth = character.health.health;
    const originalDamage = 1;
    character.health.takeDamage(originalDamage);

    // Then health was not damaged
    expect(character.health.health).toBe(initialHealth);
  });

  it.skip("can take damage after entering to area", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When entering to area
    for (const event of (character.mover.onEnteringToArea as any).mock
      .calls[0]) {
      event();
    }

    // And take damage
    const initialHealth = character.health.health();
    const originalDamage = 1;
    character.health.takeDamage(originalDamage);

    // Then health was damaged
    expect(character.health.health()).toBe(initialHealth - originalDamage);
  });

  it.skip("do not take damage after exiting to area", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When entering to area
    for (const event of (character.mover.onEnteringToArea as any).mock
      .calls[0]) {
      event();
    }

    // And exiting to area
    for (const event of (character.mover.onExitingFromArea as any).mock
      .calls[0]) {
      event();
    }

    // And take damage
    const initialHealth = character.health.health;
    const originalDamage = 1;
    character.health.takeDamage(originalDamage);

    // Then health was not damaged
    expect(character.health.health()).toBe(initialHealth);
  });

  it("kill actor when killed", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When kill Character
    character.kill();

    // Then actor was killed
    expect(character.actor.kill).toBeCalled();
  });

  it("don't update actor when updated", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When update Character directory
    character.update(simpleMock(), 10);

    // Then actor was not updated
    expect(character.actor.update).not.toBeCalled();
  });
});
