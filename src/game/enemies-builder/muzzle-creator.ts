import { Muzzle } from "../weapon/muzzle";
import { BulletsPool } from "../weapon/bullets-pool";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { ExtendedActor } from "../actor/extended-actor";
import { EventDispatcher } from "../common/event-dispatcher";

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

  public create(): Map<string, Muzzle> {
    const muzzlesKeyValue = this.muzzleInfoList.map((info: MuzzleInfo): [
      string,
      Muzzle
    ] => {
      const pos = this.coordinatesConverter.toCanvasVector(info.offsetInArea);
      const muzzle = new Muzzle({
        bulletsPool: info.bulletsPool,
        damage: info.damage,
        isPlayerSide: this.isPlayerSide,
        actor: new ExtendedActor({
          pos,
          coordinatesConverter: this.coordinatesConverter,
          collisions: this.collisions,
          onEnteringToArea: new EventDispatcher<void>(),
          onExitingFromArea: new EventDispatcher<void>()
        })
      });
      return [info.name, muzzle];
    });

    return new Map(muzzlesKeyValue);
  }
}
