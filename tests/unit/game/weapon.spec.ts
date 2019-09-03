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

    // And player was not finished
    player.isRunning = true;

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

    // And player was not finished
    player.isRunning = true;

    // And update weapon with delta time total >= 1/60 sec
    const frameMilliSec = Math.ceil((1 / 60) * 1000);
    const deltaTime = frameMilliSec * (2 / 3);
    weapon.tick(deltaTime);
    weapon.tick(deltaTime);

    // Then GunTree player was continued
    expect(player.tick).toBeCalled();
  });

  it("can stop firing when GunTree was finished", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And player was finished
    player.isRunning = false;

    // And stop firing
    weapon.stopFiring();

    // And update weapon
    const deltaTime = 1; // Any sec
    weapon.tick(deltaTime);

    // Then GunTree player was stopped
    expect(weapon.isFiring).toBe(false);
  });

  it("can not stop firing when GunTree was not finished", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And player was not finished
    player.isRunning = true;

    // And stop firing
    weapon.stopFiring();

    // And update weapon
    const deltaTime = 1; // Any sec
    weapon.tick(deltaTime);

    // Then GunTree player was not stopped
    expect(weapon.isFiring).toBe(true);
  });

  it("can be requested stop firing immediately", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And player was not finished
    player.isRunning = true;

    // And stop firing immediately
    weapon.stopFiring(true);

    // And update weapon
    const deltaTime = 1; // Any sec
    weapon.tick(deltaTime);

    // Then GunTree player was stopped
    expect(weapon.isFiring).toBe(false);
  });

  it("start GunTree when updated if now firing and player was stopped", (): void => {
    // Given GunTree player
    const player = simpleMock<gt.Player>();
    player.start = jest.fn();
    player.tick = jest.fn();

    // And Weapon
    const weapon = new Weapon(player);

    // When start firing
    weapon.startFiring();

    // And player was finished
    player.isRunning = false;

    // And update weapon
    const deltaTime = Math.ceil((1 / 60) * 1000);
    weapon.tick(deltaTime);

    // Then GunTree player was started again
    expect(player.start).toBeCalledTimes(2);
  });
});
