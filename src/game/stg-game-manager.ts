import * as ex from "excalibur";
import { CoordinatesConverter } from "./coordinates-converter";
import { BulletsPool } from "./bullets-pool";
import { Collisions } from "./collision-groups";

export class STGGameManager {
  public readonly engine: ex.Engine;
  public readonly coordinatesConverter: CoordinatesConverter;
  public readonly bulletsPools: Map<string, BulletsPool> = new Map();
  public readonly collisions: Collisions;

  public constructor(engine: ex.Engine) {
    this.engine = engine;

    this.coordinatesConverter = this.createCoordinatesConverter(engine);
    this.collisions = new Collisions();
  }

  private createCoordinatesConverter(engine: ex.Engine): CoordinatesConverter {
    const aspectRatio = 4 / 3;
    const rawWidth = engine.drawWidth;
    const rawHeight = engine.drawHeight;
    const size = {
      width: Math.min(rawWidth, rawHeight / aspectRatio),
      height: Math.min(rawHeight, rawWidth * aspectRatio)
    };
    return new CoordinatesConverter({
      areaSizeInCanvas: size.height,
      visualAreaSizeInCanvas: { x: size.width, y: size.height },
      centerInCanvas: { x: size.width / 2, y: size.height / 2 }
    });
  }
}
