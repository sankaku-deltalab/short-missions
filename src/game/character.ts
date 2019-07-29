import * as ex from "excalibur";
import { Weapon } from "./weapon";
import { ExtendedActorArgs } from "./util";
import { HealthComponent } from "./health-component";

export interface CharacterArgs extends ExtendedActorArgs {
  isPlayerSide: boolean;
  health: HealthComponent;
  weapon?: Weapon;
}

/**
 * Character represent one character moving on screen.
 *
 * e.g. player character or one of enemies.
 */
export class Character extends ex.Actor {
  public readonly isPlayerSide: boolean;
  public readonly weapon: Weapon | undefined;
  public readonly health: HealthComponent;

  public constructor(args: CharacterArgs) {
    super(args);
    this.isPlayerSide = args.isPlayerSide;
    this.weapon = args.weapon;
    this.health = args.health;

    this.on("postupdate", (event: ex.PostUpdateEvent): void => {
      if (this.weapon === undefined) return;
      this.weapon.tick(event.delta);
    });

    this.on("postkill", (_event: ex.PostKillEvent): void => {
      if (this.weapon === undefined) return;
      this.weapon.stopFiring(true);
    });

    // Setup collision
    const collision = this.isPlayerSide
      ? args.collisions.player
      : args.collisions.enemy;
    this.body.collider.group = collision;
  }
}
