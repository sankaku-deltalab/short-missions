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
  private killTimer: ex.Timer;

  public constructor(actor: ExtendedActor) {
    this.actor = actor;
    this.actor.useSelfInWrapper(this);
    this.killTimer = new ex.Timer((): void => {
      this.kill();
    }, 200);

    actor.on("precollision", (event: ex.PreCollisionEvent<ex.Actor>): void => {
      const other = event.other;
      if (!(other instanceof ExtendedActor)) return;
      const character = other.owner();
      if (!(character instanceof Character)) return;
      this.hitTo(character);
    });

    actor.onExitingFromArea(() => {
      this.killTimer.reset();
      actor.scene.addTimer(this.killTimer);
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
    this.killTimer.cancel();
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
