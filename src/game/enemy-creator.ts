import * as ex from "excalibur";
import { Collisions } from "./collision-groups";
import { CoordinatesConverter } from "./coordinates-converter";
import { WeaponCreator } from "./weapon-creator";
import { Character } from "./character";
import { HealthComponent } from "./health-component";
import { ExtendedActor } from "./extended-actor";
import { MuzzleCreator } from "./muzzle-creator";
import { StaticEnemyMoverCreator } from "./static-enemy-mover-creator";

export interface EnemyCreatorArgs {
  // TODO: Add visual thing
  collisions: Collisions;
  coordinatesConverter: CoordinatesConverter;
  health: number;
  muzzleCreator: MuzzleCreator;
  weaponCreator: WeaponCreator;
  staticEnemyMoverCreator: StaticEnemyMoverCreator;
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
  private readonly staticEnemyMoverCreator: StaticEnemyMoverCreator;
  private readonly sizeInArea: ex.Vector;

  public constructor(args: EnemyCreatorArgs) {
    this.collisions = args.collisions;
    this.coordinatedConverter = args.coordinatesConverter;
    this.health = args.health;
    this.muzzleCreator = args.muzzleCreator;
    this.weaponCreator = args.weaponCreator;
    this.staticEnemyMoverCreator = args.staticEnemyMoverCreator;
    this.sizeInArea = args.sizeInArea;
  }

  public create(activatePosInArea: ex.Vector): Character {
    // Create mover
    const mover = this.staticEnemyMoverCreator.create(activatePosInArea);

    // Create character
    const sizeInCanvasScale = this.sizeInArea.scale(
      this.coordinatedConverter.areaSizeInCanvas
    );
    const color = ex.Color.Rose;
    const enemy = new Character({
      mover,
      health: new HealthComponent(100, 100),
      isPlayerSide: false,
      actor: new ExtendedActor({
        // TODO: Add visual thing
        color, // TODO: Remove color when visual was set
        coordinatesConverter: this.coordinatedConverter,
        width: sizeInCanvasScale.y,
        height: sizeInCanvasScale.x,
        collisions: this.collisions
      })
    });

    // Create muzzles
    const muzzles = this.muzzleCreator.create(enemy.actor);

    // Create weapon
    const weapon = this.weaponCreator.create(muzzles);
    enemy.setWeapon(weapon);

    return enemy;
  }
}
