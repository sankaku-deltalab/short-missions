import * as ex from "excalibur";
import { ExtendedActorArgs } from "./util";
import { Collisions } from "./collision-groups";
import { Character } from "./character";
import { ZIndex } from "./z-index";

export interface BulletInitializeArgs {
  damage: number;
  pos: ex.Vector;
  rotation: number;
  speed: number;
  isPlayerSide: boolean;
}

export class Bullet extends ex.Actor {
  public isPlayerSide: boolean = true;
  private readonly collisions: Collisions;
  private damage: number = 0;

  public constructor(args: ExtendedActorArgs) {
    super(args);
    this.collisions = args.collisions;

    this.on("precollision", (event: ex.PreCollisionEvent<ex.Actor>): void => {
      if (!(event.other instanceof Character)) return;
      this.hitTo(event.other);
    });
  }

  public init(args: BulletInitializeArgs): void {
    this.damage = args.damage;
    this.pos = args.pos.clone();
    this.rotation = args.rotation;
    this.vel = ex.Vector.fromAngle(this.rotation - Math.PI / 2).scale(
      args.speed
    );
    this.isPlayerSide = args.isPlayerSide;

    const collision = this.isPlayerSide
      ? this.collisions.playerBullet
      : this.collisions.enemyBullet;
    this.body.collider.group = collision;

    const zIndex = args.isPlayerSide ? ZIndex.playerBullet : ZIndex.enemyBullet;
    this.setZIndex(zIndex);

    if (this.isKilled()) {
      this.unkill();
    }
  }

  public hitTo(other: Character): void {
    other.health.takeDamage(this.damage);
    this.kill();
  }
}
