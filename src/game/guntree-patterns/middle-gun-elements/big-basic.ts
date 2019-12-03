import * as gt from "guntree";

const baseSpeed = 0.5;
const centerMuzzle = "centerMuzzle";
const rightMuzzle = "rightMuzzle";
const leftMuzzle = "leftMuzzle";

/**
 *
 * @param rank {0, ..., 4}
 */
const nWayBigCenter = (rank: number): gt.Gun => {
  const interval = 180 / (rank + 2);
  const ways = 3 + rank;
  const totalAngle = 5 + rank * 3;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat(
      { times: 1, interval },
      gt.nWay({ ways, totalAngle }, gt.fire(gt.bullet()))
    )
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const triangleBigSide = (rank: number): gt.Gun => {
  const totalTime = 30;
  const ways = 2 + rank;
  const interval = 3;
  const waitFrames = totalTime - ways * interval;
  const totalAngle = 10 + rank * 3;
  return gt.concat(
    gt.useMuzzle(rightMuzzle),
    gt.mirror(
      { invertedMuzzleName: leftMuzzle, mirrorTranslationY: true },
      gt.useVirtualMuzzle(gt.fixedAimMuzzle()),
      gt.mltSpeed(baseSpeed),
      gt.addAngle(totalAngle / 2),
      gt.repeat(
        { times: ways, interval, name: "sweep" },
        gt.addAngle(gt.linear(-totalAngle / 2 + 2, totalAngle / 2, "sweep")),
        gt.mltSpeed(gt.linear(1.1, 0.9, "sweep")),
        gt.fire(gt.bullet())
      )
    ),
    gt.wait(waitFrames)
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const triangleBigCenter = (rank: number): gt.Gun => {
  const totalTime = 30;
  const ways = 2 + rank;
  const interval = 3;
  const waitFrames = totalTime - ways * interval;
  const totalAngle = 10 + rank * 2;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.mirror(
      { mirrorTranslationY: true },
      gt.useVirtualMuzzle(gt.fixedAimMuzzle()),
      gt.mltSpeed(baseSpeed),
      gt.addAngle(totalAngle / 2),
      gt.repeat(
        { times: ways, interval, name: "sweep" },
        gt.addAngle(gt.linear(-totalAngle / 2 + 2, totalAngle / 2, "sweep")),
        gt.mltSpeed(gt.linear(1.0, 0.9, "sweep")),
        gt.fire(gt.bullet())
      )
    ),
    gt.wait(waitFrames)
  );
};

export const nWayBigCenters = Array(5)
  .fill(0)
  .map((_, idx) => nWayBigCenter(idx));

export const triangleBigSides = Array(5)
  .fill(0)
  .map((_, idx) => triangleBigSide(idx));

export const triangleBigCenters = Array(5)
  .fill(0)
  .map((_, idx) => triangleBigCenter(idx));
