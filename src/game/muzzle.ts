import * as ex from "excalibur";
import * as mat from "transformation-matrix";
import * as gt from "guntree";
import { CoordinatesConverter } from "./coordinates-converter";
import { BulletsPool } from "./bullets-pool";

export interface MuzzleArgs extends ex.IActorArgs {
  coordinatesConverter: CoordinatesConverter;
  bulletsPool: BulletsPool;
  isPlayerSide: boolean;
}

/**
 * Muzzle represent bullet firing system.
 *
 * @example
 * > import * as gt from "guntree";
 * >
 * > const character = foo;
 * > const muzzle = new Muzzle(bar);
 * > character.add(muzzle);
 * >
 * > const player = gt.Player({ "centerMuzzle": muzzle })
 * > player.setGunTree(gt.nop());
 * > const weapon = new Weapon(player);
 * > weapon.start();
 */
export class Muzzle extends ex.Actor implements gt.Muzzle {
  private readonly coordinatesConverter: CoordinatesConverter;
  private readonly bulletsPool: BulletsPool;
  public isPlayerSide: boolean = true;

  public constructor(args: MuzzleArgs) {
    super(args);

    this.coordinatesConverter = args.coordinatesConverter;
    this.bulletsPool = args.bulletsPool;
    this.isPlayerSide = args.isPlayerSide;
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

    const [posInArea, rotationDeg, _scale] = gt.decomposeTransform(
      data.transform
    );
    const rotation = rotationDeg * (Math.PI / 180);
    const speed = data.parameters.get("speed");
    if (speed === undefined)
      throw new Error("GunTree parameter must have 'speed'");
    const posAsPoint = this.coordinatesConverter.toCanvasPoint(posInArea);
    const pos = new ex.Vector(posAsPoint.x, posAsPoint.y);

    this.scene.add(bullet);
    bullet.init({
      pos,
      rotation,
      speed: speed * this.coordinatesConverter.areaSizeInCanvas,
      isPlayerSide: this.isPlayerSide
    });
  }

  /**
   * Get muzzle transform.
   */
  public getMuzzleTransform(): mat.Matrix {
    const areaPos = this.coordinatesConverter.toAreaPoint(this.getWorldPos());
    return mat.transform(
      mat.translate(areaPos.x, areaPos.y),
      mat.rotate(this.getWorldRotation())
    );
  }

  /**
   * Get enemy transform.
   */
  public getEnemyTransform(): mat.Matrix {
    throw new Error("Write this");
  }
}
