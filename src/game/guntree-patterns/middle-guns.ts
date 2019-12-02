import * as gt from "guntree";
import * as basic from "./middle-gun-elements/basic";
import * as big from "./middle-gun-elements/big-basic";
import * as spread from "./middle-gun-elements/spread";
import * as block from "./middle-gun-elements/block";

const connect = (
  gun1: gt.Gun,
  interval1: number,
  gun2: gt.Gun,
  interval2: number
): gt.Gun => {
  return gt.sequential(gun1, gt.wait(interval1), gun2, gt.wait(interval2));
};

export const nWayBasics = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      spread.nWayCenters[idx],
      45,
      basic.basicSides[idx],
      60
    )
  );

export const sweepBasics = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      spread.sweepSides[idx],
      15,
      basic.basicCenters[idx],
      60
    )
  );

export const static2WayHBlocks = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      block.static2WayHBlocks[idx],
      15,
      basic.basicSides[idx],
      60
    )
  );

export const staticNWayVBlocks = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      block.staticNWayVBlockSides[idx],
      15,
      basic.basicCenters[idx],
      60
    )
  );

export const nWayBigCenters = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      big.nWayBigCenters[idx],
      15,
      basic.basicSides[idx],
      60
    )
  );

export const triangleBigSides = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      big.triangleBigSides[idx],
      15,
      basic.basicCenters[idx],
      60
    )
  );

export const triangleBigCenters = Array(5)
  .fill(0)
  .map((_, idx) =>
    connect(
      big.triangleBigCenters[idx],
      15,
      basic.basicSides[idx],
      60
    )
  );
