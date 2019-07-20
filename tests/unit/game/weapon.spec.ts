import * as gt from "guntree";
import { simpleMock } from "../../test-util";
import { Weapon } from "@/game/weapon";

describe("Weapon", (): void => {
  it("can fire with guntree", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // Then GunTree player was started
    expect(player.start).toBeCalled();
  });

  it("not continue firing in total delta time < 1/60", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And update weapon with delta time < 1/60 sec
    const frameMilliSec = Math.ceil((1 / 60) * 1000);
    const deltaTime = frameMilliSec * (2 / 3);
    weapon.tick(deltaTime);

    // Then GunTree player was continued
    expect(player.tick).not.toBeCalled();
  });

  it("continue firing in total delta time >= 1/60", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And update weapon with delta time total >= 1/60 sec
    const frameMilliSec = Math.ceil((1 / 60) * 1000);
    const deltaTime = frameMilliSec * (2 / 3);
    weapon.tick(deltaTime);
    weapon.tick(deltaTime);

    // Then GunTree player was continued
    expect(player.tick).toBeCalled();
  });
});
