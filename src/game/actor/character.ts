import * as ex from "excalibur";
import { Weapon } from "../weapon/weapon";
import { ExtendedActor } from "./extended-actor";
import { HealthComponent } from "../health-component";
import { ActorWrapper } from "./actor-wrapper";
import { Mover } from "../mover/mover";

export interface CharacterArgs {
  isPlayerSide: boolean;
  health: HealthComponent;
  actor: ExtendedActor;
  mover: Mover;
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
  public readonly mover: Mover;
  private weaponInner?: Weapon;
  private isInArea: boolean;

  public constructor(args: CharacterArgs) {
    this.actor = args.actor;
    this.actor.owner = this;
    this.isPlayerSide = args.isPlayerSide;
    this.health = args.health;
    this.mover = args.mover;
    this.isInArea = false;

    this.health.onDied((): void => {
      this.kill();
    });

    this.health.damageAbsorber = (damage: number): number => {
      return this.isInArea ? damage : 0;
    };

    this.mover.onEnteringToArea((): void => {
      this.isInArea = true;
    });

    this.mover.onExitingFromArea((): void => {
      this.isInArea = false;
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
   * Start owning mover.
   */
  public startMover(): void {
    this.mover.start(this);
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
    if (this.mover !== undefined) {
      this.mover.update(deltaTimeMS);
    }
  }

  public kill(): void {
    this.actor.kill();
    if (this.weapon !== undefined) {
      this.weapon.stopFiring(true);
    }
  }
}
