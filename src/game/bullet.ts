import * as ex from "excalibur";
import { Character } from "./character";
import { ZIndex } from "./z-index";
import { ActorWrapper } from "./actor-wrapper";
import { ExtendedActor } from "./extended-actor";

export interface BulletInitializeArgs {
  damage: number;
  posInArea: ex.Vector;
  rotation: number;
  speed: number;
  isPlayerSide: boolean;
}

export class Bullet implements ActorWrapper {
  public isPlayerSideInner: boolean = true;
  public readonly actor: ExtendedActor;
  private damage: number = 0;

  public constructor(actor: ExtendedActor) {
    this.actor = actor;

    actor.on("precollision", (event: ex.PreCollisionEvent<ex.Actor>): void => {
      const other = event.other;
      if (!(other instanceof ExtendedActor)) return;
      const character = other.owner;
      if (!(character instanceof Character)) return;
      this.hitTo(character);
    });
  }

  public get isPlayerSide(): boolean {
    return this.isPlayerSideInner;
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
    this.actor.posInArea = args.posInArea;
    this.actor.rotation = args.rotation;
    this.actor.vel = ex.Vector.fromAngle(
      this.actor.rotation - Math.PI / 2
    ).scale(args.speed);
    this.isPlayerSideInner = args.isPlayerSide;

    const cols = this.actor.collisions;
    const collision = this.isPlayerSide ? cols.playerBullet : cols.enemyBullet;
    this.actor.setCollision(collision);

    const zIndex = args.isPlayerSide ? ZIndex.playerBullet : ZIndex.enemyBullet;
    this.actor.setZIndex(zIndex);

    if (this.actor.isKilled()) {
      this.actor.unkill();
    }
  }

  public hitTo(other: Character): void {
    other.health.takeDamage(this.damage);
    this.kill();
  }
}
