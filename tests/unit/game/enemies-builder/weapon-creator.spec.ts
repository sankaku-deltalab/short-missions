import * as gt from "guntree";
import { simpleMock } from "../../../test-util";
import { Weapon } from "@/game/weapon/weapon";
import { WeaponCreator } from "@/game/enemies-builder/weapon-creator";
import { Muzzle } from "@/game/weapon/muzzle";

describe("WeaponCreator", (): void => {
  it("need Gun when constructed", (): void => {
    // Given Gun
    const gun = simpleMock<gt.Gun>();

    // When construct WeaponCreator
    const create = (): void => {
      new WeaponCreator(gun);
    };

    // Then not throw error
    expect(create).not.toThrowError();
  });

  it("can create Weapon with muzzles", (): void => {
    // Given WeaponCreator
    const gun = simpleMock<gt.Gun>();
    const wc = new WeaponCreator(gun);

    // When create weapon
    const muzzles = new Map([["centerMuzzle", simpleMock<Muzzle>()]]);
    const weapon = wc.create(muzzles);

    // Then weapon is Weapon class
    expect(weapon).toBeInstanceOf(Weapon);
  });
});
