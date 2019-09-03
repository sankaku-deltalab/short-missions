import { Muzzle } from "./muzzle";
import { BulletsPool } from "./bullets-pool";
import { Collisions } from "./collision-groups";
import { CoordinatesConverter } from "./coordinates-converter";
import { ExtendedActor } from "./extended-actor";

export interface MuzzleCreatorArgs {
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  isPlayerSide: boolean;
  muzzleInfoList: MuzzleInfo[];
}

export interface MuzzleInfo {
  name: string;
  offsetInArea: ex.Vector;
  damage: number;
  bulletsPool: BulletsPool;
}

export class MuzzleCreator {
  private readonly collisions: Collisions;
  private readonly coordinatesConverter: CoordinatesConverter;
  private readonly isPlayerSide: boolean;
  private readonly muzzleInfoList: MuzzleInfo[];

  public constructor(args: MuzzleCreatorArgs) {
    this.collisions = args.collisions;
    this.coordinatesConverter = args.coordinatesConverter;
    this.isPlayerSide = args.isPlayerSide;
    this.muzzleInfoList = args.muzzleInfoList;
  }

  public create(muzzlesOwner: ex.Actor): { [key: string]: Muzzle } {
    const muzzles: { [key: string]: Muzzle } = {};

    this.muzzleInfoList.forEach((info: MuzzleInfo): void => {
      const pos = this.coordinatesConverter.toCanvasVector(info.offsetInArea);
      const muzzle = new Muzzle({
        bulletsPool: info.bulletsPool,
        damage: info.damage,
        isPlayerSide: this.isPlayerSide,
        actor: new ExtendedActor({
          pos,
          coordinatesConverter: this.coordinatesConverter,
          collisions: this.collisions
        })
      });
      muzzles[info.name] = muzzle;

      muzzlesOwner.add(muzzle.actor);
    });

    return muzzles;
  }
}
