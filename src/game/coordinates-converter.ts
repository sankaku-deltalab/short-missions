import * as mat from "transformation-matrix";
import * as ex from "excalibur";
import { pointToVector } from "./util";

const pointToArray = (p: mat.Point): [number, number] => [p.x, p.y];

export interface CoordinatesConverterArgs {
  /** Square area size in canvas.  */
  areaSizeInCanvas: number;
  /** Visual area size in canvas (x: right, y: under) */
  visualAreaSizeInCanvas: mat.Point;
  /** Area center location in canvas (x: right, y: under) */
  centerInCanvas: mat.Point;
}

/**
 * Convert area (:= [-0.5, 0.5]^2) coordinates (x: upper, y: right) to
 * specified canvas coordinates (x: right, y: under).
 *
 * CoordinatesConverter define "area" and "visual area".
 * Area is square, but visual area is rectangle.
 */
export class CoordinatesConverter {
  public readonly areaSizeInCanvas: number;
  public readonly visualAreaSizeInCanvas: ex.Vector;
  private readonly areaToCanvasTrans: mat.Matrix;
  private readonly visualAreaToCanvasTrans: mat.Matrix;
  public readonly centerInCanvas: ex.Vector;
  public readonly visualNWInCanvas: ex.Vector;
  public readonly visualSEInCanvas: ex.Vector;

  public constructor(args: CoordinatesConverterArgs) {
    this.areaSizeInCanvas = args.areaSizeInCanvas;
    this.visualAreaSizeInCanvas = pointToVector(args.visualAreaSizeInCanvas);
    this.centerInCanvas = pointToVector(args.centerInCanvas);

    this.areaToCanvasTrans = mat.transform(
      mat.translate(...pointToArray(args.centerInCanvas)),
      mat.scale(args.areaSizeInCanvas),
      mat.rotateDEG(-90)
    );
    this.visualAreaToCanvasTrans = mat.transform(
      mat.translate(...pointToArray(args.centerInCanvas)),
      mat.scale(...pointToArray(args.visualAreaSizeInCanvas)),
      mat.rotateDEG(-90)
    );

    this.visualNWInCanvas = this.toCanvasPointFromVisualArea({
      x: 0.5,
      y: -0.5
    });
    this.visualSEInCanvas = this.toCanvasPointFromVisualArea({
      x: -0.5,
      y: 0.5
    });
  }

  /**
   * Convert area point to canvas point.
   *
   * @param pointInArea Point in square area
   */
  public toCanvasPoint(pointInArea: mat.Point): ex.Vector {
    const point = mat.applyToPoint(this.areaToCanvasTrans, pointInArea);
    return pointToVector(point);
  }

  /**
   * Convert area point to canvas point.
   *
   * @param pointInVisualArea Point in square field
   */
  public toCanvasPointFromVisualArea(pointInVisualArea: mat.Point): ex.Vector {
    const point = mat.applyToPoint(
      this.visualAreaToCanvasTrans,
      pointInVisualArea
    );
    return pointToVector(point);
  }

  /**
   * Convert canvas point to area point.
   *
   * @param pointInCanvas Point in canvas
   */
  public toAreaPoint(pointInCanvas: mat.Point): ex.Vector {
    const point = mat.applyToPoint(
      mat.inverse(this.areaToCanvasTrans),
      pointInCanvas
    );
    return pointToVector(point);
  }

  /**
   * Convert canvas point to visual area point.
   *
   * @param pointInCanvas Point in canvas
   */
  public toVisualAreaPoint(pointInCanvas: mat.Point): ex.Vector {
    const point = mat.applyToPoint(
      mat.inverse(this.visualAreaToCanvasTrans),
      pointInCanvas
    );
    return pointToVector(point);
  }

  /**
   * Clamp canvas point in visual area.
   *
   * @param pointInCanvas Point in canvas
   */
  public clampCanvasPointInVisualArea(pointInCanvas: mat.Point): ex.Vector {
    const pointInVisualArea = this.toVisualAreaPoint(pointInCanvas);
    const pointInVisualAreaClamped = {
      x: ex.Util.clamp(pointInVisualArea.x, -0.5, 0.5),
      y: ex.Util.clamp(pointInVisualArea.y, -0.5, 0.5)
    };
    return this.toCanvasPointFromVisualArea(pointInVisualAreaClamped);
  }
}
