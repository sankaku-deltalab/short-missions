import { EnemyMoveRoute } from "./enemy-move-route";
import { Mover } from "./mover";
import { ActorWrapper } from "../actor/actor-wrapper";

export interface StaticEnemyMoverArgs {
  route: EnemyMoveRoute;
}

/**
 * Move enemy with static route.
 */
export class StaticEnemyMover implements Mover {
  private playedTimeMS = 0;
  private owner?: ActorWrapper;
  private route: EnemyMoveRoute;

  public constructor(args: StaticEnemyMoverArgs) {
    this.route = args.route;
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public start(owner: ActorWrapper): void {
    this.owner = owner;
    this.playedTimeMS = 0;
    this.owner.actor.moveToPosInArea(this.route.getInitialPosition());
  }

  /**
   * Set moved owner and start moving.
   *
   * @param owner Moved by this.
   */
  public update(deltaTimeMS: number): void {
    if (this.owner === undefined) throw new Error("This is not started yet");

    this.playedTimeMS += deltaTimeMS;
    this.owner.actor.moveToPosInArea(
      this.route.calcPositionInArea(this.playedTimeMS)
    );
  }
}
