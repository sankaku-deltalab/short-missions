import * as gt from "guntree";

const frameMilliSec = Math.ceil((1 / 60) * 1000);

/**
 * Weapon manage firing with GunTree.
 */
export class Weapon {
  private player: gt.Player;
  private pooledMilliSeconds: number = 0;
  private isFiringInternal: boolean = false;

  /**
   *
   * @param player GunTree player must already set GunTree and muzzles
   */
  public constructor(player: gt.Player) {
    this.player = player;
  }

  /**
   * Is firing.
   */
  public get isFiring(): boolean {
    return this.isFiringInternal;
  }

  /**
   * Start firing.
   */
  public startFiring(): void {
    this.pooledMilliSeconds = 0;
    this.isFiringInternal = true;
    this.player.start();
  }

  /**
   * Update.
   *
   * @param deltaMilliSeconds
   */
  public tick(deltaMilliSeconds: number): void {
    if (!this.isFiring) return;

    this.pooledMilliSeconds += deltaMilliSeconds;
    while (this.pooledMilliSeconds >= frameMilliSec) {
      this.pooledMilliSeconds -= frameMilliSec;
      this.player.tick();
    }
  }
}
