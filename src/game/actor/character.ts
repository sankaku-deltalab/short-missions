import * as ex from "excalibur";
import { Weapon } from "../weapon/weapon";
import { ExtendedActor } from "./extended-actor";
import { HealthComponent } from "../health-component";
import { ActorWrapper } from "./actor-wrapper";
import { Mover } from "../mover/mover";
import { Muzzle } from "../weapon/muzzle";
import { ZIndex } from "../common/z-index";

export interface CharacterArgs {
  isPlayerSide: boolean;
  health: HealthComponent;
  actor: ExtendedActor;
  mover: Mover;
  weapon: Weapon;
  muzzles: Map<string, Muzzle>;
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
  private readonly muzzles: Map<string, Muzzle>;
  private isInArea: boolean;

  public constructor(args: CharacterArgs) {
    this.actor = args.actor;
    this._isPlayerSide = args.isPlayerSide;
    this.healthComponent = args.health;
    this.mover = args.mover;
    this.weapon = args.weapon;
    this.muzzles = args.muzzles;
    this.isInArea = false;

    this.actor.useSelfInWrapper(this);

    // Set muzzle as child of self
    for (const [_name, muzzle] of this.muzzles) {
      this.actor.add(muzzle.actor);
    }

    // Update status when enter to or exit from area
    this.mover.onEnteringToArea((): void => {
      this.isInArea = true;
    });
    this.mover.onExitingFromArea((): void => {
      this.isInArea = false;
    });

    // Kill this when died
    this.healthComponent.onDied((): void => {
      this.kill();
    });

    // Setup collision
    const collision = this._isPlayerSide
      ? args.actor.collisions.player
      : args.actor.collisions.enemy;
    this.actor.setCollision(collision);
  }

  /**
   * Self is player side character.
   */
  public isPlayerSide(): boolean {
    return this._isPlayerSide;
  }

  /**
   * Add self to scene.
   * Use this function instead of `ex.Scene.add`
   *
   * @param scene
   */
  public addSelfToScene(scene: ex.Scene): void {
    scene.add(this.actor);
    for (const [_name, muzzle] of this.muzzles) {
      scene.add(muzzle.actor);
    }

    // Set z-index
    const zIndex = this.isPlayerSide() ? ZIndex.player : ZIndex.enemy;
    this.actor.setZIndex(zIndex);
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
  }

  /**
   * Add event on damaged.
   *
   * @param event
   * @returns Event remover
   */
  public onTakeDamage(event: (damage: number) => void): () => void {
    return this.healthComponent.onTakeDamage(event);
  }

  /**
   * Add event on healed.
   *
   * @param event
   * @returns Event remover
   */
  public onHealed(event: (amount: number) => void): () => void {
    return this.healthComponent.onHealed(event);
  }

  /**
   * Add event on died.
   *
   * @param event
   * @returns Event remover
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
   * @param event
   * @returns Event remover
   */
  public onEnteringToArea(event: () => void): () => void {
    return this.mover.onEnteringToArea(event);
  }

  /**
   * Add event called when exiting from area.
   *
   * @param event
   * @returns Event remover
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
