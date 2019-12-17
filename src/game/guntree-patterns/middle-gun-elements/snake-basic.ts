import * as gt from "guntree";

const baseSpeed = 0.5;
const centerMuzzle = "centerMuzzle";

/**
 *
 * @param rank {0, ..., 4}
 */
const accelSnakeCenter = (rank: number): gt.Gun => {
  const totalTime = 30;
  const times = 4 + rank;
  const interval = 3;
  const waitFrames = totalTime - times * interval;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat(
      { times: times, interval, name: "rep" },
      gt.mltSpeed(gt.linear(0.7, 1.2, "rep")),
      gt.fire(gt.bullet())
    ),
    gt.wait(waitFrames)
  );
};

/**
 *
 * @param rank {0, ..., 4}
 */
const triangleSnakeCenter = (rank: number): gt.Gun => {
  const totalTime = 30;
  const ways = 2 + rank;
  const interval = 3;
  const waitFrames = totalTime - ways * interval;
  const totalAngle = 5 + rank;
  return gt.concat(
    gt.useMuzzle(centerMuzzle),
    gt.useVirtualMuzzle(gt.aimingMuzzle()),
    gt.mltSpeed(baseSpeed),
    gt.repeat(
      { times: ways, interval, name: "rep" },
      gt.alternate(
        { mirrorTranslationY: true },
        gt.repeat(
          { times: 1, interval },
          gt.addAngle(totalAngle / 2),
          gt.addAngle(gt.linear(-totalAngle / 2 + 2, totalAngle / 2, "rep")),
          gt.fire(gt.bullet())
        )
      )
    ),
    gt.wait(waitFrames)
  );
};

export const accelSnakeCenters = Array(5)
  .fill(0)
  .map((_, idx) => accelSnakeCenter(idx));

export const triangleSnakeCenters = Array(5)
  .fill(0)
  .map((_, idx) => triangleSnakeCenter(idx));
