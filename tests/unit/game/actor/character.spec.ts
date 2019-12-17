import { simpleMock } from "../../../test-util";
import { Weapon } from "@/game/weapon/weapon";
import { Character, CharacterArgs } from "@/game/actor/character";
import { createCollisionsMock, createSceneMock } from "../test-game-util";
import { HealthComponent } from "@/game/health-component";
import { ExtendedActor } from "@/game/actor/extended-actor";
import { Mover } from "@/game/mover/mover";
import { Muzzle } from "@/game/weapon/muzzle";

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

function createWeaponMock(): Weapon {
  return simpleMock<Weapon>({
    startFiring: jest.fn(),
    stopFiring: jest.fn(),
    isFiring: jest.fn().mockReturnValue(true),
    tick: jest.fn()
  });
}

function createMuzzleMock(): Muzzle {
  return simpleMock<Muzzle>({
    actor: simpleMock()
  });
}

function createActorMock(): ExtendedActor {
  return simpleMock<ExtendedActor>({
    add: jest.fn(),
    on: jest.fn(),
    collisions: createCollisionsMock(),
    setCollision: jest.fn(),
    kill: jest.fn(),
    update: jest.fn(),
    useSelfInWrapper: jest.fn(),
    setZIndex: jest.fn(),
    onEnteringToArea: jest.fn(),
    onExitingFromArea: jest.fn()
  });
}

function createCharacterArgs(): CharacterArgs {
  return {
    isPlayerSide: true,
    health: createHealthComponentMock(),
    actor: createActorMock(),
    mover: createMoverMock(),
    weapon: createWeaponMock(),
    muzzles: new Map<string, Muzzle>([
      ["muzzle1", createMuzzleMock()],
      ["muzzle2", createMuzzleMock()]
    ])
  };
}

describe("Character", (): void => {
  it("can add self to scene with muzzles", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // And scene
    const scene = createSceneMock();

    // When add Character to scene
    character.addSelfToScene(scene);

    // Then muzzles was added to scene
    expect(args.muzzles.size).not.toBe(0);
    for (const [_muzzleName, muzzle] of args.muzzles) {
      expect(scene.add).toBeCalledWith(muzzle.actor);
    }
  });

  it("add muzzles to self", (): void => {
    // When create Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // Then muzzles was added to Character
    expect(args.muzzles.size).not.toBe(0);
    for (const [_muzzleName, muzzle] of args.muzzles) {
      expect(character.actor.add).toBeCalledWith(muzzle.actor);
    }
  });

  it("tick weapon when updated", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When update Character
    const engine = simpleMock<ex.Engine>();
    const deltaTime = 3;
    character.update(engine, deltaTime);

    // Then weapon was ticked
    expect(args.weapon.tick).toBeCalledWith(deltaTime);
  });

  it("stop weapon immediately when killed", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When Character was killed
    character.kill();

    // Then weapon was ticked
    expect(args.weapon.stopFiring).toBeCalledWith(true);
  });

  it("stop weapon immediately when died", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When Character was died
    character.die();

    // Then weapon was ticked
    expect(args.weapon.stopFiring).toBeCalledWith(true);
  });

  it.each`
    isPlayerSide | collisionName
    ${true}      | ${"player"}
    ${false}     | ${"enemy"}
  `(
    "set collision as $collisionName if isPlayerSide is $isPlayerSide",
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

  it("killed when died", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);
    character.kill = jest.fn();

    // When died Character
    character.die();

    // Then character was killed
    expect(character.kill).toBeCalled();
  });

  it("can start owning mover", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When start mover
    character.startMoving();

    // Then mover was started
    expect(args.mover.start).toBeCalledWith(character);
  });

  it("update mover if using it", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When start mover
    character.startMoving();

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
    const initialHealth = character.health();
    const originalDamage = 1;
    const takenDamage = character.takeDamage(originalDamage);

    // Then health was not damaged
    expect(character.health()).toBe(initialHealth);
    expect(takenDamage).toBe(0);
  });

  it("can take damage after entering to area", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When entering to area
    for (const eventArgs of (args.actor.onEnteringToArea as any).mock.calls) {
      eventArgs[0]();
    }

    // And take damage
    const damage = 1;
    const takenDamage = character.takeDamage(damage);

    // Then health was damaged
    expect(args.health.takeDamage).toBeCalledWith(damage);
    expect(takenDamage).toBe(damage);
  });

  it("do not take damage after exiting to area", (): void => {
    // Given Character
    const args = createCharacterArgs();
    const character = new Character(args);

    // When entering to area
    for (const eventArgs of (args.actor.onEnteringToArea as any).mock.calls) {
      eventArgs[0]();
    }

    // And exiting to area
    for (const eventArgs of (args.actor.onExitingFromArea as any).mock.calls) {
      eventArgs[0]();
    }

    // And take damage
    const damage = 1;
    character.takeDamage(damage);

    // Then health was damaged
    expect(args.health.takeDamage).toBeCalledWith(0);
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
