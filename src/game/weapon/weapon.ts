import * as gt from "guntree";

const frameMilliSec = Math.ceil((1 / 60) * 1000);

/**
 * Weapon manage firing with GunTree.
 */
export class Weapon {
  private player: gt.Player;
  private pooledMilliSeconds = 0;
  private isFiringInternal = false;
  private isRequestedFiring = false;

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
    this.isRequestedFiring = true;
    if (this.isFiringInternal) return;

    this.pooledMilliSeconds = 0;
    this.isFiringInternal = true;
    this.player.start();
  }

  /**
   * Stop firing.
   *
   * @param immediately Immediately stop firing
   */
  public stopFiring(immediately = false): void {
    this.isRequestedFiring = false;

    if (immediately) {
      this.isFiringInternal = false;
    }
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

      if (this.isRequestedFiring && !this.player.isRunning) {
        this.player.start();
      } else {
        this.player.tick();
      }
    }

    if (!this.isRequestedFiring && !this.player.isRunning) {
      this.isFiringInternal = false;
    }
  }
}
