import * as ex from "excalibur";
import { Character } from "../actor/character";
import { ZIndex } from "../common/z-index";
import { ActorWrapper } from "../actor/actor-wrapper";
import { ExtendedActor } from "../actor/extended-actor";

export interface BulletInitializeArgs {
  damage: number;
  posInArea: ex.Vector;
  rotation: number;
  speed: number;
  isPlayerSide: boolean;
}

export class Bullet implements ActorWrapper {
  private _isPlayerSide = true;
  public readonly actor: ExtendedActor;
  private damage = 0;

  public constructor(actor: ExtendedActor) {
    this.actor = actor;

    actor.on("precollision", (event: ex.PreCollisionEvent<ex.Actor>): void => {
      const other = event.other;
      if (!(other instanceof ExtendedActor)) return;
      const character = other.owner();
      if (!(character instanceof Character)) return;
      this.hitTo(character);
    });
  }

  public isPlayerSide(): boolean {
    return this._isPlayerSide;
  }

  /**
   * Update status.
   * Called by actor.
   *
   * @param engine
   * @param deltaTimeMS
   */
  public update(_engine: ex.Engine, _deltaTimeMS: number): void {}

  public kill(): void {
    this.actor.kill();
  }

  public init(args: BulletInitializeArgs): void {
    this.damage = args.damage;
    this.actor.moveToPosInArea(args.posInArea);
    this.actor.rotation = args.rotation;
    this.actor.vel = ex.Vector.fromAngle(
      this.actor.rotation - Math.PI / 2
    ).scale(args.speed);
    this._isPlayerSide = args.isPlayerSide;

    const cols = this.actor.collisions;
    const collision = args.isPlayerSide ? cols.playerBullet : cols.enemyBullet;
    this.actor.setCollision(collision);

    const zIndex = args.isPlayerSide ? ZIndex.playerBullet : ZIndex.enemyBullet;
    this.actor.setZIndex(zIndex);

    if (this.actor.isKilled()) {
      this.actor.unkill();
    }
  }

  public hitTo(other: Character): void {
    other.takeDamage(this.damage);
    this.kill();
  }
}
