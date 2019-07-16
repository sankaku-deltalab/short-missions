import * as ex from "excalibur";
import { Bullet } from "@/game/bullet";
import { simpleMock } from "../../test-util";

describe("Bullet", (): void => {
  it("must be initialized with pos, rotation, speed and isPlayerSide", (): void => {
    // Given Bullet
    const bullet = new Bullet();

    // When initialize bullet
    // Then error was not thrown
    const initArgs = {
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    expect((): void => bullet.init(initArgs)).not.toThrowError();
  });

  it("unkilled if killed when initialized", (): void => {
    // Given Bullet
    const bullet = new Bullet();
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
      pos: new ex.Vector(3, 5),
      rotation: 0,
      speed: 1,
      isPlayerSide: true
    };
    bullet.init(initArgs);

    // Then bullet was unkilled
    expect(bullet.unkill).toBeCalled();
  });
});
