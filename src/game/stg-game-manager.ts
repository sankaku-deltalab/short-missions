import * as ex from "excalibur";
import { CoordinatesConverter } from "./common/coordinates-converter";
import { BulletsPool } from "./weapon/bullets-pool";
import { Collisions } from "./common/collision-groups";
import { UIRequests, OutGameUIRequest } from "./ui-request";

export class STGGameManager {
  public readonly engine: ex.Engine;
  public readonly coordinatesConverter: CoordinatesConverter;
  public readonly bulletsPools: Map<string, BulletsPool> = new Map();
  public readonly collisions: Collisions;
  public uiRequests: UIRequests;

  public constructor(engine: ex.Engine, uiRequests: UIRequests) {
    this.engine = engine;

    this.uiRequests = uiRequests;
    this.coordinatesConverter = this.createCoordinatesConverter(engine);
    this.collisions = new Collisions();
  }

  public start(): void {
    this.engine.start();
    this.uiRequests.outGameUIRequest = OutGameUIRequest.menu;
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
