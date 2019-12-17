import * as ex from "excalibur";
import { Collisions } from "../common/collision-groups";
import { CoordinatesConverter } from "../common/coordinates-converter";
import { WeaponCreator } from "./weapon-creator";
import { Character } from "../actor/character";
import { HealthComponent } from "../health-component";
import { ExtendedActor } from "../actor/extended-actor";
import { MuzzleCreator } from "./muzzle-creator";
import { Mover } from "../mover/mover";
import { EventDispatcher } from "../common/event-dispatcher";

export interface EnemyCreatorArgs {
  texturePath: string;
  textureSizeInArea: ex.Vector;
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
  private readonly texture: ex.Texture;
  private readonly spriteSizeInArea: ex.Vector;
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

    this.texture = new ex.Texture(args.texturePath);
    this.spriteSizeInArea = args.textureSizeInArea;
    this.texture.load();
  }

  public create(mover: Mover): Character {
    // Create actor
    const sizeInCanvasScale = this.sizeInArea.scale(
      this.coordinatedConverter.areaSizeInCanvas
    );
    const actor = new ExtendedActor({
      posInArea: new ex.Vector(1, 1),
      coordinatesConverter: this.coordinatedConverter,
      width: sizeInCanvasScale.y,
      height: sizeInCanvasScale.x,
      rotation: Math.PI,
      collisions: this.collisions,
      onEnteringToArea: new EventDispatcher<void>(),
      onExitingFromArea: new EventDispatcher<void>()
    });
    const setDrawing = (): void => {
      const sprite = new ex.Sprite({
        image: this.texture,
        width: this.texture.width,
        height: this.texture.height,
        scale: new ex.Vector(
          this.spriteSizeInArea.y / this.texture.width,
          this.spriteSizeInArea.x / this.texture.height
        ).scale(this.coordinatedConverter.areaSizeInCanvas)
      });
      actor.addDrawing(sprite);
    };
    if (this.texture.isLoaded()) {
      setDrawing();
    } else {
      this.texture.loaded.then(setDrawing);
    }

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
