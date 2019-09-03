import * as ex from "excalibur";
import * as mat from "transformation-matrix";

export function pointToVector(point: mat.Point): ex.Vector {
  return new ex.Vector(point.x, point.y);
}
