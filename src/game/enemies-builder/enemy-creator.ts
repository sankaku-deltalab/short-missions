import * as ex from "excalibur";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { WeaponCreator } from "./weapon-creator";
import { Character } from "../actor/character";
import { HealthComponent } from "../health-component";
import { ExtendedActor } from "../actor/extended-actor";
import { MuzzleCreator } from "./muzzle-creator";
import { Mover } from "../mover/mover";

export interface EnemyCreatorArgs {
  // TODO: Add visual thing
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  health: number;
  muzzleCreator: MuzzleCreator;
  weaponCreator: WeaponCreator;
  sizeInArea: ex.Vector;
}

export interface MuzzleInfo {
  name: string;
  offsetInArea: ex.Vector;
}

export class EnemyCreator {
  private readonly collisions: Collisions;
  private readonly coordinatedConverter: CoordinatesConverter;
  private readonly health: number;
  private readonly muzzleCreator: MuzzleCreator;
  private readonly weaponCreator: WeaponCreator;
  private readonly sizeInArea: ex.Vector;

  public constructor(args: EnemyCreatorArgs) {
    this.collisions = args.collisions;
    this.coordinatedConverter = args.coordinatesConverter;
    this.health = args.health;
    this.muzzleCreator = args.muzzleCreator;
    this.weaponCreator = args.weaponCreator;
    this.sizeInArea = args.sizeInArea;
  }

  public create(mover: Mover): Character {
    // Create actor
    const color = ex.Color.Rose;
    const sizeInCanvasScale = this.sizeInArea.scale(
      this.coordinatedConverter.areaSizeInCanvas
    );
    const actor = new ExtendedActor({
      // TODO: Add visual thing
      color, // TODO: Remove color when visual was set
      coordinatesConverter: this.coordinatedConverter,
      width: sizeInCanvasScale.y,
      height: sizeInCanvasScale.x,
      collisions: this.collisions
    });

    // Create muzzles
    const muzzles = this.muzzleCreator.create();

    // Create weapon
    const weapon = this.weaponCreator.create(muzzles);

    // Create character
    const enemy = new Character({
      mover,
      weapon,
      health: new HealthComponent(this.health, this.health),
      isPlayerSide: false,
      actor,
      muzzles
    });

    return enemy;
  }
}
