import * as ex from "excalibur";
import { Weapon } from "./weapon";
import { ExtendedActorArgs } from "./util";

export interface CharacterArgs extends ExtendedActorArgs {
  isPlayerSide: boolean;
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

  public constructor(args: CharacterArgs) {
    super(args);
    this.isPlayerSide = args.isPlayerSide;
    this.weapon = args.weapon;

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
