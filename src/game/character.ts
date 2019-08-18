import * as ex from "excalibur";
import { Weapon } from "./weapon";
import { ExtendedActor } from "./extended-actor";
import { HealthComponent } from "./health-component";
import { ActorWrapper } from "./actor-wrapper";

export interface CharacterArgs {
  isPlayerSide: boolean;
  health: HealthComponent;
  actor: ExtendedActor;
}

/**
 * Character represent one character moving on screen.
 *
 * e.g. player character or one of enemies.
 */
export class Character implements ActorWrapper {
  public readonly actor: ExtendedActor;
  public readonly isPlayerSide: boolean;
  public readonly health: HealthComponent;
  private weaponInner?: Weapon;

  public constructor(args: CharacterArgs) {
    this.actor = args.actor;
    this.actor.owner = this;
    this.isPlayerSide = args.isPlayerSide;
    this.health = args.health;

    this.health.onDied.add((): void => {
      this.kill();
    });

    // Setup collision
    const collision = this.isPlayerSide
      ? args.actor.collisions.player
      : args.actor.collisions.enemy;
    this.actor.setCollision(collision);
  }

  public get weapon(): Weapon | undefined {
    return this.weaponInner;
  }

  public setWeapon(weapon: Weapon): void {
    if (this.weapon !== undefined) throw new Error("weapon was already set");
    this.weaponInner = weapon;
  }

  /**
   * Update status.
   * Called by actor.
   *
   * @param engine
   * @param deltaTimeMS
   */
  public update(_engine: ex.Engine, deltaTimeMS: number): void {
    if (this.weapon !== undefined) {
      this.weapon.tick(deltaTimeMS);
    }
  }

  public kill(): void {
    this.actor.kill();
    if (this.weapon !== undefined) {
      this.weapon.stopFiring(true);
    }
  }
}
