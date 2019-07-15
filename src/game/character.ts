import * as ex from "excalibur";

export interface CharacterArgs extends ex.IActorArgs {
  isPlayerSide: boolean;
}

/**
 * Character represent one character moving on screen.
 *
 * e.g. player character or one of enemies.
 */
export class Character extends ex.Actor {
  public readonly isPlayerSide: boolean;

  public constructor(args: CharacterArgs) {
    super(args);
    this.isPlayerSide = args.isPlayerSide;
  }
}
