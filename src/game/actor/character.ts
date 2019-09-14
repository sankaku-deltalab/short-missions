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
  weapon: Weapon;
}

/**
 * Character represent one character moving on screen.
 *
 * e.g. player character or one of enemies.
 */
export class Character implements ActorWrapper {
  public readonly actor: ExtendedActor;
  private readonly _isPlayerSide: boolean;
  private readonly healthComponent: HealthComponent;
  private readonly mover: Mover;
  private weapon: Weapon;
  private isInArea: boolean;

  public constructor(args: CharacterArgs) {
    this.actor = args.actor;
    this._isPlayerSide = args.isPlayerSide;
    this.healthComponent = args.health;
    this.mover = args.mover;
    this.weapon = args.weapon;
    this.isInArea = false;

    this.mover.onEnteringToArea((): void => {
      this.isInArea = true;
    });

    this.mover.onExitingFromArea((): void => {
      this.isInArea = false;
    });

    // Setup collision
    const collision = this._isPlayerSide
      ? args.actor.collisions.player
      : args.actor.collisions.enemy;
    this.actor.setCollision(collision);
  }

  public isPlayerSide(): boolean {
    return this._isPlayerSide;
  }

  // Health component

  /**
   * Get health.
   */
  public health(): number {
    return this.healthComponent.health();
  }

  /**
   * Get max health.
   */
  public maxHealth(): number {
    return this.healthComponent.maxHealth();
  }

  /**
   * Is dead.
   */
  public isDead(): boolean {
    return this.healthComponent.isDead();
  }

  /**
   * Take damage.
   *
   * @param damage Damage amount
   */
  public takeDamage(damage: number): void {
    const absorbedDamage = this.isInArea ? damage : 0;
    return this.healthComponent.takeDamage(absorbedDamage);
  }

  /**
   * Heal damage.
   * Health is clamped by maxHealth.
   * Can not heal while dead.
   *
   * @param healAmount Heal amount
   */
  public heal(healAmount: number): void {
    return this.healthComponent.heal(healAmount);
  }

  /**
   * Kill this.
   */
  public die(): void {
    this.healthComponent.die();
    this.kill();
  }

  /**
   * Add event on damaged.
   *
   * @param event Event remover
   */
  public onTakeDamage(event: (damage: number) => void): () => void {
    return this.healthComponent.onTakeDamage(event);
  }

  /**
   * Add event on healed.
   *
   * @param event Event remover
   */
  public onHealed(event: (amount: number) => void): () => void {
    return this.healthComponent.onHealed(event);
  }

  /**
   * Add event on died.
   *
   * @param event Event remover
   */
  public onDied(event: () => void): () => void {
    return this.healthComponent.onDied(event);
  }

  // Mover

  /**
   * Start moving.
   */
  public startMoving(): void {
    this.mover.start(this);
  }

  /**
   * Add event called when entering to area.
   *
   * @param event Event remover
   */
  public onEnteringToArea(event: () => void): () => void {
    return this.mover.onEnteringToArea(event);
  }

  /**
   * Add event called when exiting from area.
   *
   * @param event Event remover
   */
  public onExitingFromArea(event: () => void): () => void {
    return this.mover.onExitingFromArea(event);
  }

  // Weapon

  /**
   * Is firing.
   */
  public isFiring(): boolean {
    return this.weapon.isFiring;
  }

  /**
   * Start firing.
   */
  public startFiring(): void {
    this.weapon.startFiring();
  }

  /**
   * Stop firing.
   *
   * @param immediately Immediately stop firing
   */
  public stopFiring(immediately = false): void {
    this.weapon.stopFiring(immediately);
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
    this.weapon.stopFiring(true);
  }
}
