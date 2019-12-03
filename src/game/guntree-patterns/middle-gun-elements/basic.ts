import * as gt from "guntree";

const baseSpeed = 0.5;
const centerMuzzle = "centerMuzzle";
const rightMuzzle = "rightMuzzle";
const leftMuzzle = "leftMuzzle";

/**
 *
 * @param rank {0, ..., 4}
 */
const basicCenter = (rank: number): gt.Gun => {
  const times = rank * 2 + 3;
  const interval = Math.floor(90 / times);
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat({ times, interval }, gt.fire(gt.bullet()))
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const basicSide = (rank: number): gt.Gun => {
  const times = rank * 2 + 3;
  const interval = Math.floor(120 / times);
  return gt.concat(
    gt.useMuzzle(leftMuzzle),
    gt.mirror(
      { invertedMuzzleName: rightMuzzle, mirrorTranslationY: true },
      gt.useVirtualMuzzle(gt.aimingMuzzle()),
      gt.mltSpeed(baseSpeed),
      gt.repeat({ times, interval }, gt.fire(gt.bullet()))
    )
  );
};

export const basicCenters = Array(5)
  .fill(0)
  .map((_, idx) => basicCenter(idx));

export const basicSides = Array(5)
  .fill(0)
  .map((_, idx) => basicSide(idx));
