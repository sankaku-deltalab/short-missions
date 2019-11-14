import * as gt from "guntree";

const baseSpeed = 0.5;

/**
 *
 * @param rank {0, ..., 4}
 */
const basic = (rank: number): gt.Gun => {
  const interval = 90 / (rank + 1);
  return gt.concat(
    gt.useMuzzle("centerMuzzle"),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat({ times: 1, interval }, gt.fire(gt.bullet()))
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const burst = (rank: number): gt.Gun => {
  const totalTime = 90;
  const firingTime = 30;
  const fireNum = rank + 2;
  const interval = Math.floor(firingTime / fireNum);
  const reloadTime = totalTime - interval * fireNum;
  return gt.concat(
    gt.useMuzzle("centerMuzzle"),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.sequential(
      gt.repeat({ times: fireNum, interval }, gt.fire(gt.bullet())),
      gt.wait(reloadTime)
    )
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const bigBasic = (rank: number): gt.Gun => {
  const interval = 180 / (rank + 2);
  const ways = 3 + Math.floor(rank / 2) * 2;
  const totalAngle = 3 + rank * 1;
  return gt.concat(
    gt.useMuzzle("centerMuzzle"),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat(
      { times: 1, interval },
      gt.nWay({ ways, totalAngle }, gt.fire(gt.bullet()))
    )
  );
};

export const basics = Array(5)
  .fill(0)
  .map((_, idx) => basic(idx));

export const bursts = Array(5)
  .fill(0)
  .map((_, idx) => burst(idx));

export const bigBasics = Array(5)
  .fill(0)
  .map((_, idx) => bigBasic(idx));
