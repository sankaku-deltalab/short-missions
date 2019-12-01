import * as gt from "guntree";

const baseSpeed = 0.5;
const centerMuzzle = "centerMuzzle";
const rightMuzzle = "rightMuzzle";
const leftMuzzle = "leftMuzzle";

/**
 *
 * @param rank {0, ..., 4}
 */
const static2WayHBlock = (rank: number): gt.Gun => {
  const blockWays = 3 + rank;
  const blockTotalAngle = 10 + rank * 5;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.mltSpeed(baseSpeed),
    gt.nWay(
      { ways: 2, totalAngle: 60 },
      gt.nWay(
        { ways: blockWays, totalAngle: blockTotalAngle },
        gt.fire(gt.bullet())
      )
    )
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const static2WayVBlockSide = (rank: number): gt.Gun => {
  const repeatTimes = 3 + rank;
  const repeatInterval = Math.floor(15 / repeatTimes);
  return gt.concat(
    gt.useMuzzle(rightMuzzle),
    gt.mltSpeed(baseSpeed),
    gt.mirror(
      { invertedMuzzleName: leftMuzzle, mirrorTranslationY: true },
      gt.addAngle(20),
      gt.repeat(
        { times: repeatTimes, interval: repeatInterval },
        gt.fire(gt.bullet())
      )
    )
    // gt.nWay(
    //   { ways: 2, totalAngle: 60 },
    //   gt.repeat(
    //     { times: repeatTimes, interval: repeatInterval },
    //     gt.fire(gt.bullet())
    //   )
    // )
  );
};

export const static2WayHBlocks = Array(5)
  .fill(0)
  .map((_, idx) => static2WayHBlock(idx));

export const staticNWayVBlockSides = Array(5)
  .fill(0)
  .map((_, idx) => static2WayVBlockSide(idx));
