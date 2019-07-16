import * as ex from "excalibur";

export interface BulletInitializeArgs {
  pos: ex.Vector;
  rotation: number;
  speed: number;
  isPlayerSide: boolean;
}

export class Bullet extends ex.Actor {
  public isPlayerSide: boolean = true;

  public init(args: BulletInitializeArgs): void {
    this.pos = args.pos.clone();
    this.rotation = args.rotation;
    this.vel = ex.Vector.fromAngle(this.rotation).scale(args.speed);
    this.isPlayerSide = args.isPlayerSide;

    if (this.isKilled()) {
      this.unkill();
    }
  }
}
