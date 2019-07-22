import * as ex from "excalibur";
import { ExtendedActorArgs } from "./util";
import { Collisions } from "./collision-groups";

export interface BulletInitializeArgs {
  pos: ex.Vector;
  rotation: number;
  speed: number;
  isPlayerSide: boolean;
}

export class Bullet extends ex.Actor {
  public isPlayerSide: boolean = true;
  private readonly collisions: Collisions;

  public constructor(args: ExtendedActorArgs) {
    super(args);
    this.collisions = args.collisions;
  }

  public init(args: BulletInitializeArgs): void {
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

    if (this.isKilled()) {
      this.unkill();
    }
  }
}
