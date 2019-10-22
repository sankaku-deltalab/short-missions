import * as ex from "excalibur";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";

const delta = Math.pow(10, -10);

describe("CoordinatesConverter", (): void => {
  it("still has arguments as ex.Vector", (): void => {
    // Given CoordinatesConverter arguments
    const args = {
      areaSizeInCanvas: 1,
      visualAreaSizeInCanvas: { x: 1, y: 1 },
      centerInCanvas: { x: 0.5, y: 0.5 }
    };

    // When create CoordinatesConverter
    const cc = new CoordinatesConverter(args);

    // Then CoordinatesConverter has arguments
    expect(cc.areaSizeInCanvas).toBe(args.areaSizeInCanvas);
    const argumentNames: ("visualAreaSizeInCanvas" | "centerInCanvas")[] = [
      "visualAreaSizeInCanvas",
      "centerInCanvas"
    ];
    for (const arg of argumentNames) {
      expect(cc[arg]).toBeInstanceOf(ex.Vector);
      expect(cc[arg].x).toBe(args[arg].x);
      expect(cc[arg].y).toBe(args[arg].y);
    }
  });

  it.each`
    areaSizeInCanvas | centerInCanvas        | canvasPoint           | expectedAreaPoint
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 200, y: 0 }}   | ${{ x: 0.5, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 200, y: 400 }} | ${{ x: -0.5, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 400, y: 200 }} | ${{ x: 0, y: 0.5 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 200 }}   | ${{ x: 0, y: -0.5 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 400, y: 0 }}   | ${{ x: 0.5, y: 0.5 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0 }}     | ${{ x: 0.5, y: -0.5 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 400, y: 400 }} | ${{ x: -0.5, y: 0.5 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 400 }}   | ${{ x: -0.5, y: -0.5 }}
  `(
    "can convert canvas point $canvasPoint to area Point as ex.Vector",
    ({
      areaSizeInCanvas,
      centerInCanvas,
      canvasPoint,
      expectedAreaPoint
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas,
        centerInCanvas,
        visualAreaSizeInCanvas: { x: 2, y: 2 }
      });

      // When convert canvas point to area point
      const actualAreaPoint = cc.toAreaPoint(canvasPoint);

      // Then get area point as ex.Vector
      expect(actualAreaPoint).toBeInstanceOf(ex.Vector);
      expect(actualAreaPoint.x).toBeCloseTo(expectedAreaPoint.x);
      expect(actualAreaPoint.y).toBeCloseTo(expectedAreaPoint.y);
    }
  );

  it.each`
    visualAreaSizeInCanvas | centerInCanvas        | canvasPoint           | expectedVisualAreaPoint
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 150, y: 0 }}   | ${{ x: 0.5, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 150, y: 400 }} | ${{ x: -0.5, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 300, y: 200 }} | ${{ x: 0, y: 0.5 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 200 }}   | ${{ x: 0, y: -0.5 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 300, y: 0 }}   | ${{ x: 0.5, y: 0.5 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 0 }}     | ${{ x: 0.5, y: -0.5 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 300, y: 400 }} | ${{ x: -0.5, y: 0.5 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 400 }}   | ${{ x: -0.5, y: -0.5 }}
  `(
    "can convert canvas point $canvasPoint to visual area Point as ex.Vector",
    ({
      visualAreaSizeInCanvas,
      centerInCanvas,
      canvasPoint,
      expectedVisualAreaPoint
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        centerInCanvas,
        visualAreaSizeInCanvas,
        areaSizeInCanvas: 2
      });

      // When convert canvas point to visual area point
      const actualVisualAreaPoint = cc.toVisualAreaPoint(canvasPoint);

      // Then get area point as ex.Vector
      expect(actualVisualAreaPoint).toBeInstanceOf(ex.Vector);
      expect(actualVisualAreaPoint.x).toBeCloseTo(expectedVisualAreaPoint.x);
      expect(actualVisualAreaPoint.y).toBeCloseTo(expectedVisualAreaPoint.y);
    }
  );

  it.each`
    areaSizeInCanvas | centerInCanvas        | areaPoint               | expectedCanvasPoint
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0 }}       | ${{ x: 200, y: 200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: 0 }}     | ${{ x: 200, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: 0 }}    | ${{ x: 200, y: 400 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0.5 }}     | ${{ x: 400, y: 200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: -0.5 }}    | ${{ x: 0, y: 200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: 0.5 }}   | ${{ x: 400, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: -0.5 }}  | ${{ x: 0, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: 0.5 }}  | ${{ x: 400, y: 400 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: -0.5 }} | ${{ x: 0, y: 400 }}
  `(
    "can convert area point $areaPoint to canvas Point as ex.Vector",
    ({
      areaSizeInCanvas,
      centerInCanvas,
      areaPoint,
      expectedCanvasPoint
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas,
        centerInCanvas,
        visualAreaSizeInCanvas: { x: 2, y: 2 }
      });

      // When convert area point to canvas point
      const actualCanvasPoint = cc.toCanvasPoint(areaPoint);

      // Then get area point as ex.Vector
      expect(actualCanvasPoint).toBeInstanceOf(ex.Vector);
      expect(actualCanvasPoint.x).toBeCloseTo(expectedCanvasPoint.x);
      expect(actualCanvasPoint.y).toBeCloseTo(expectedCanvasPoint.y);
    }
  );

  it.each`
    visualAreaSizeInCanvas | centerInCanvas        | visualAreaPoint         | expectedCanvasPoint
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 0 }}       | ${{ x: 150, y: 200 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0.5, y: 0 }}     | ${{ x: 150, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: -0.5, y: 0 }}    | ${{ x: 150, y: 400 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: 0.5 }}     | ${{ x: 300, y: 200 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0, y: -0.5 }}    | ${{ x: 0, y: 200 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0.5, y: 0.5 }}   | ${{ x: 300, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: 0.5, y: -0.5 }}  | ${{ x: 0, y: 0 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: -0.5, y: 0.5 }}  | ${{ x: 300, y: 400 }}
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }} | ${{ x: -0.5, y: -0.5 }} | ${{ x: 0, y: 400 }}
  `(
    "can convert visual area point $visualAreaPoint to canvas Point as ex.Vector",
    ({
      visualAreaSizeInCanvas,
      centerInCanvas,
      visualAreaPoint,
      expectedCanvasPoint
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        centerInCanvas,
        visualAreaSizeInCanvas,
        areaSizeInCanvas: 2
      });

      // When convert visual area point to canvas point
      const actualCanvasPoint = cc.toCanvasPointFromVisualArea(visualAreaPoint);

      // Then get area point as ex.Vector
      expect(actualCanvasPoint).toBeInstanceOf(ex.Vector);
      expect(actualCanvasPoint.x).toBeCloseTo(expectedCanvasPoint.x);
      expect(actualCanvasPoint.y).toBeCloseTo(expectedCanvasPoint.y);
    }
  );

  it.each`
    posX   | posY   | visualAreaSizeX | visualAreaSizeY | centerInCanvasX | centerInCanvasY | clampedPosX | clampedPosY
    ${50}  | ${50}  | ${100}          | ${100}          | ${50}           | ${50}           | ${50}       | ${50}
    ${100} | ${100} | ${100}          | ${100}          | ${50}           | ${50}           | ${100}      | ${100}
    ${101} | ${100} | ${100}          | ${100}          | ${50}           | ${50}           | ${100}      | ${100}
    ${100} | ${101} | ${100}          | ${100}          | ${50}           | ${50}           | ${100}      | ${100}
  `(
    "can clamp canvas point in visual area",
    ({
      posX,
      posY,
      visualAreaSizeX,
      visualAreaSizeY,
      centerInCanvasX,
      centerInCanvasY,
      clampedPosX,
      clampedPosY
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas: 1,
        visualAreaSizeInCanvas: { x: visualAreaSizeX, y: visualAreaSizeY },
        centerInCanvas: { x: centerInCanvasX, y: centerInCanvasY }
      });

      // When clamp position
      const canvasPoint = { x: posX, y: posY };
      const clampedPoint = cc.clampCanvasPointInVisualArea(canvasPoint);

      // Then get clamped point
      expect(clampedPoint.x).toBeCloseTo(clampedPosX);
      expect(clampedPoint.y).toBeCloseTo(clampedPosY);
    }
  );

  it.each`
    visualAreaSizeInCanvas | pointInCanvas                     | expectedIsInArea
    ${{ x: 300, y: 400 }}  | ${{ x: 150, y: 200 }}             | ${true}
    ${{ x: 300, y: 400 }}  | ${{ x: 0 + delta, y: 0 + delta }} | ${true}
    ${{ x: 300, y: 400 }}  | ${{ x: 300, y: 400 }}             | ${true}
    ${{ x: 300, y: 400 }}  | ${{ x: 301, y: 400 }}             | ${false}
    ${{ x: 300, y: 400 }}  | ${{ x: 300, y: 401 }}             | ${false}
    ${{ x: 300, y: 400 }}  | ${{ x: -1, y: 0 }}                | ${false}
    ${{ x: 300, y: 400 }}  | ${{ x: 0, y: -1 }}                | ${false}
  `(
    "can check canvas point $pointInCanvas is in visual area",
    ({ visualAreaSizeInCanvas, pointInCanvas, expectedIsInArea }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        visualAreaSizeInCanvas,
        areaSizeInCanvas: 1,
        centerInCanvas: {
          x: visualAreaSizeInCanvas.x / 2,
          y: visualAreaSizeInCanvas.y / 2
        }
      });

      // When check is in visual area
      const isInArea = cc.canvasPointIsInVisualArea(pointInCanvas);

      // Then get point in canvas
      expect(isInArea).toBe(expectedIsInArea);
    }
  );

  it.each`
    areaSizeInCanvas | centerInCanvas        | areaVector              | expectedCanvasVector
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0 }}       | ${{ x: 0, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: 0 }}     | ${{ x: 0, y: -200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: 0 }}    | ${{ x: 0, y: 200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: 0.5 }}     | ${{ x: 200, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0, y: -0.5 }}    | ${{ x: -200, y: 0 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: 0.5 }}   | ${{ x: 200, y: -200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: 0.5, y: -0.5 }}  | ${{ x: -200, y: -200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: 0.5 }}  | ${{ x: 200, y: 200 }}
    ${400}           | ${{ x: 200, y: 200 }} | ${{ x: -0.5, y: -0.5 }} | ${{ x: -200, y: 200 }}
  `(
    "can convert area vector $areaPoint to canvas vector as ex.Vector",
    ({
      areaSizeInCanvas,
      centerInCanvas,
      areaVector,
      expectedCanvasVector
    }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas,
        centerInCanvas,
        visualAreaSizeInCanvas: { x: 2, y: 2 }
      });

      // When convert area vector to canvas vector
      const actualCanvasVector = cc.toCanvasVector(areaVector);

      // Then get canvas vector as ex.Vector
      expect(actualCanvasVector).toBeInstanceOf(ex.Vector);
      expect(actualCanvasVector.x).toBeCloseTo(expectedCanvasVector.x);
      expect(actualCanvasVector.y).toBeCloseTo(expectedCanvasVector.y);
    }
  );
});
