import { simpleMock } from "../../test-util";
import { Weapon } from "@/game/weapon";
import { Character } from "@/game/character";
import { createCollisionsMock } from "./test-game-util";

describe("Character", (): void => {
  it("tick weapon when updated", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();
    weapon.tick = jest.fn();

    // And Character
    const character = new Character({
      weapon,
      isPlayerSide: true,
      collisions: createCollisionsMock()
    });

    // When update Character
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
      weapon,
      isPlayerSide: true,
      collisions: createCollisionsMock()
    });

    // When Character was killed
    const scene = simpleMock<ex.Scene>();
    scene.remove = jest.fn();
    character.scene = scene;
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
      const collisions = createCollisionsMock();

      // And Character
      const character = new Character({
        isPlayerSide,
        collisions
      });

      // Then character was set collision
      const expectedCollision =
        collisionName === "player" ? collisions.player : collisions.enemy;
      expect(character.body.collider.group).toBe(expectedCollision);
    }
  );
});
