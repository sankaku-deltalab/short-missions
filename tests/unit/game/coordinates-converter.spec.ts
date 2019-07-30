import { CoordinatesConverter } from "@/game/coordinates-converter";

describe("CoordinatesConverter", (): void => {
  it.each`
    areaX   | areaY   | canvasX | canvasY
    ${0}    | ${0}    | ${0.5}  | ${0.5}
    ${0.5}  | ${0}    | ${0.5}  | ${0}
    ${0}    | ${0.5}  | ${1}    | ${0.5}
    ${-0.5} | ${0}    | ${0.5}  | ${1}
    ${0}    | ${-0.5} | ${0}    | ${0.5}
  `(
    "use x for top, and y for right",
    ({ areaX, areaY, canvasX, canvasY }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas: 1,
        visualAreaSizeInCanvas: { x: 1, y: 1 },
        centerInCanvas: { x: 0.5, y: 0.5 }
      });

      // When convert point
      const areaPoint = { x: areaX, y: areaY };
      const canvasPoint = cc.toCanvasPointFromVisualArea(areaPoint);

      // Then get point in canvas
      expect(canvasPoint.x).toBeCloseTo(canvasX);
      expect(canvasPoint.y).toBeCloseTo(canvasY);
    }
  );
  it("has arguments", (): void => {
    // Given CoordinatesConverter arguments
    const areaSizeInCanvas = 1;
    const visualAreaSizeInCanvas = { x: 1, y: 1 };
    const centerInCanvas = { x: 0.5, y: 0.5 };

    // When create CoordinatesConverter
    const cc = new CoordinatesConverter({
      areaSizeInCanvas,
      visualAreaSizeInCanvas,
      centerInCanvas
    });

    // Then CoordinatesConverter has arguments
    expect(cc.areaSizeInCanvas).toBe(areaSizeInCanvas);
    expect(cc.visualAreaSizeInCanvas).toEqual(visualAreaSizeInCanvas);
    expect(cc.centerInCanvas).toEqual(centerInCanvas);
  });

  it.each`
    offsetX | offsetY
    ${0}    | ${0}
    ${5}    | ${0}
    ${0}    | ${6}
    ${7}    | ${8}
    ${-9}   | ${-10}
    ${1.25} | ${1.5}
  `("use translation with centerInCanvas", ({ offsetX, offsetY }): void => {
    // Given CoordinatesConverter
    const cc = new CoordinatesConverter({
      areaSizeInCanvas: 1,
      visualAreaSizeInCanvas: { x: 2, y: 3 },
      centerInCanvas: { x: 150 + offsetX, y: 200 + offsetY }
    });

    // When convert center point
    const centerInField = { x: 0, y: 0 };
    const convertedCenter = cc.toCanvasPointFromVisualArea(centerInField);

    // Then get center of canvas
    expect(convertedCenter.x).toBeCloseTo(150 + offsetX);
    expect(convertedCenter.y).toBeCloseTo(200 + offsetY);
  });

  it.each`
    areaSizeInCanvas
    ${100}
    ${200}
    ${500}
  `("use scaling with areaSizeInCanvas area", ({ areaSizeInCanvas }): void => {
    // Given CoordinatesConverter
    const cc = new CoordinatesConverter({
      areaSizeInCanvas,
      visualAreaSizeInCanvas: { x: 1, y: 1 },
      centerInCanvas: { x: 0, y: 0 }
    });

    // When convert south east point
    const seInArea = { x: -0.5, y: 0.5 };
    const convertedSE = cc.toCanvasPoint(seInArea);

    // Then get center of canvas
    expect(convertedSE.x).toBeCloseTo(areaSizeInCanvas / 2);
    expect(convertedSE.y).toBeCloseTo(areaSizeInCanvas / 2);
  });

  it.each`
    areaSizeInCanvasX | areaSizeInCanvasY
    ${100}            | ${100}
    ${100}            | ${200}
    ${300}            | ${100}
  `(
    "use scaling with areaSizeInCanvas in visible area",
    ({ areaSizeInCanvasX, areaSizeInCanvasY }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas: 1,
        visualAreaSizeInCanvas: { x: areaSizeInCanvasX, y: areaSizeInCanvasY },
        centerInCanvas: { x: 0, y: 0 }
      });

      // When convert south east point
      const seInArea = { x: -0.5, y: 0.5 };
      const convertedSE = cc.toCanvasPointFromVisualArea(seInArea);

      // Then get center of canvas
      expect(convertedSE.x).toBeCloseTo(areaSizeInCanvasX / 2);
      expect(convertedSE.y).toBeCloseTo(areaSizeInCanvasY / 2);
    }
  );

  it.each`
    areaX   | areaY   | canvasX | canvasY
    ${0}    | ${0}    | ${0.5}  | ${0.5}
    ${0.5}  | ${0}    | ${0.5}  | ${0}
    ${0}    | ${0.5}  | ${1}    | ${0.5}
    ${-0.5} | ${0}    | ${0.5}  | ${1}
    ${0}    | ${-0.5} | ${0}    | ${0.5}
  `(
    "can convert canvas point to area point",
    ({ areaX, areaY, canvasX, canvasY }): void => {
      // Given CoordinatesConverter
      const cc = new CoordinatesConverter({
        areaSizeInCanvas: 1,
        visualAreaSizeInCanvas: { x: 1, y: 1 },
        centerInCanvas: { x: 0.5, y: 0.5 }
      });

      // When convert canvas point to visual area point
      const canvasPoint = { x: canvasX, y: canvasY };
      const areaPoint = cc.toAreaPoint(canvasPoint);

      // Then get point in canvas
      expect(areaPoint.x).toBeCloseTo(areaX);
      expect(areaPoint.y).toBeCloseTo(areaY);
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
});
