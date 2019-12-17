import * as gt from "guntree";

const baseSpeed = 0.5;
const centerMuzzle = "centerMuzzle";
const rightMuzzle = "rightMuzzle";
const leftMuzzle = "leftMuzzle";

/**
 *
 * @param rank {0, ..., 4}
 */
const nWayCenter = (rank: number): gt.Gun => {
  const ways = 3 + Math.floor(rank / 2) * 2;
  const totalAngle = 60 + rank * 5;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat(
      { times: 1, interval: 0 },
      gt.nWay({ ways, totalAngle }, gt.fire(gt.bullet()))
    )
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const sweepSide = (rank: number): gt.Gun => {
  const totalTime = 60;
  const ways = 3 + rank;
  const interval = totalTime / ways;
  const totalAngle = 60 + rank * 5;
  return gt.concat(
    gt.useMuzzle(leftMuzzle),
    gt.mirror(
      { invertedMuzzleName: rightMuzzle, mirrorTranslationY: true },
      gt.useVirtualMuzzle(gt.fixedAimMuzzle()),
      gt.mltSpeed(baseSpeed),
      gt.repeat(
        { times: ways, interval, name: "sweep" },
        gt.addAngle(totalAngle / 3),
        gt.addAngle(gt.centerizedLinear(-totalAngle, "sweep")),
        gt.fire(gt.bullet())
      )
    )
  );
};

export const nWayCenters = Array(5)
  .fill(0)
  .map((_, idx) => nWayCenter(idx));

export const sweepSides = Array(5)
  .fill(0)
  .map((_, idx) => sweepSide(idx));
