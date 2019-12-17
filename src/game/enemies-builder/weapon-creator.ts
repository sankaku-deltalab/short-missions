import * as gt from "guntree";
import { Muzzle } from "../weapon/muzzle";
import { Weapon } from "../weapon/weapon";

/**
 * Create weapon with specified GunTree.
 */
export class WeaponCreator {
  private guntree: gt.Gun;

  public constructor(guntree: gt.Gun) {
    this.guntree = guntree;
  }

  /**
   * Create new weapon.
   *
   * @param muzzles Muzzles would be used by created weapon.
   */
  public create(muzzles: Map<string, Muzzle>): Weapon {
    const player = gt.createDefaultPlayer(
      Object.fromEntries(muzzles.entries())
    );
    player.setGunTree(this.guntree);
    return new Weapon(player);
  }
}
