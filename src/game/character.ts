import * as ex from "excalibur";
import { Weapon } from "./weapon";

export interface CharacterArgs extends ex.IActorArgs {
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
  }
}
