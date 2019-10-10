import * as ex from "excalibur";
import * as mat from "transformation-matrix";
import * as gt from "guntree";
import { BulletsPool } from "./bullets-pool";
import { ActorWrapper } from "../actor/actor-wrapper";
import { ExtendedActor } from "../actor/extended-actor";

export interface MuzzleArgs extends ex.IActorArgs {
  damage: number;
  bulletsPool: BulletsPool;
  isPlayerSide: boolean;
  actor: ExtendedActor;
}

/**
 * Muzzle represent bullet firing system.
 */
export class Muzzle implements gt.Muzzle, ActorWrapper {
  private readonly damage: number;
  private readonly bulletsPool: BulletsPool;
  private readonly internalIsPlayerSide: boolean = true;
  public readonly actor: ExtendedActor;

  public constructor(args: MuzzleArgs) {
    this.damage = args.damage;
    this.bulletsPool = args.bulletsPool;
    this.internalIsPlayerSide = args.isPlayerSide;
    this.actor = args.actor;
    this.actor.useSelfInWrapper(this);
  }

  public update(_engine: ex.Engine, _deltaTimeMS: number): void {}

  public kill(): void {
    this.actor.kill();
  }

  public isPlayerSide(): boolean {
    return this.internalIsPlayerSide;
  }

  /**
   * Fire bullet.
   *
   * @param data FireData when fired.
   * @param bullet Firing bullet.
   */
  public fire(data: gt.FireData, _bullet: gt.Bullet): void {
    const bullet = this.bulletsPool.pop();
    if (bullet === undefined) return;

    const [posInAreaPoint, rotationDeg, _scale] = gt.decomposeTransform(
      data.transform
    );
    const posInArea = new ex.Vector(posInAreaPoint.x, posInAreaPoint.y);
    const rotation = rotationDeg * (Math.PI / 180);
    const speed = data.parameters.get("speed");
    if (speed === undefined)
      throw new Error("GunTree parameter must have 'speed'");

    this.actor.scene.add(bullet.actor);
    bullet.init({
      posInArea,
      rotation,
      damage: this.damage,
      speed: speed * this.actor.coordinatesConverter.areaSizeInCanvas,
      isPlayerSide: this.isPlayerSide()
    });
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    // const areaPos = this.actor.posInArea;
    const areaPos = this.actor.coordinatesConverter.toAreaPoint(
      this.actor.getWorldPos()
    );

    return mat.transform(
      mat.translate(areaPos.x, areaPos.y),
      mat.rotate(this.actor.getWorldRotation())
    );
  }

  /**
   * Get enemy transform.
   */
  public getEnemyTransform(): mat.Matrix {
    throw new Error("Write this");
  }
}
