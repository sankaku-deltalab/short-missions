import { simpleMock } from "../../test-util";
import { Weapon } from "@/game/weapon";
import { Character } from "@/game/character";

describe("Character", (): void => {
  it("tick weapon when updated", (): void => {
    // Given Weapon
    const weapon = simpleMock<Weapon>();
    weapon.tick = jest.fn();

    // And Character
    const character = new Character({
      weapon,
      isPlayerSide: true
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
      isPlayerSide: true
    });

    // When Character was killed
    const scene = simpleMock<ex.Scene>();
    scene.remove = jest.fn();
    character.scene = scene;
    character.kill();

    // Then weapon was ticked
    expect(weapon.stopFiring).toBeCalledWith(true);
  });
});
