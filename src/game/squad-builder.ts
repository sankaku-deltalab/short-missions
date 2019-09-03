import * as ex from "excalibur";
import { EventDispatcher } from "./event-dispatcher";
import { Squad } from "./squad";
import { EnemyCreator } from "./enemy-creator";

export interface SquadBuilderArgs {
  squad: Squad;
  scene: ex.Scene;
  onFinished: EventDispatcher<void>;
  enemyCreator: EnemyCreator;
  activatePositions: ex.Vector[];
  spawnDurationMS: number;
}

/**
 * 分隊を作る
 */
export class SquadBuilder {
  private readonly squad: Squad;
  private readonly scene: ex.Scene;
  public readonly onFinished: EventDispatcher<void>;
  private readonly enemyCreator: EnemyCreator;
  private readonly spawnDurationMS: number;
  private readonly activatePositions: ex.Vector[];
  private spawnedCount = 0;
  private timeSinceStartMS = 0;

  public constructor(args: SquadBuilderArgs) {
    this.scene = args.scene;
    this.squad = args.squad;
    this.onFinished = args.onFinished;
    this.enemyCreator = args.enemyCreator;
    this.spawnDurationMS = args.spawnDurationMS;
    this.activatePositions = args.activatePositions;
  }

  /**
   * Start squad building.
   */
  public start(): void {
    this.timeSinceStartMS = 0;
    this.update(0);
  }

  /**
   * Update squad building.
   *
   * @param deltaTimeMS Delta time in milliseconds
   */
  public update(deltaTimeMS: number): void {
    if (this.squad === undefined) return;
    this.timeSinceStartMS += deltaTimeMS;

    while (this.timeSinceStartMS >= this.spawnDurationMS * this.spawnedCount) {
      if (this.spawnedCount >= this.activatePositions.length) break;
      this.spawnNextEnemy();

      if (this.spawnedCount >= this.activatePositions.length) {
        this.finishSpawning();
      }
    }
  }

  private finishSpawning(): void {
    this.onFinished.dispatch();
    this.squad.notifyFinishSpawning();
  }

  private spawnNextEnemy(): void {
    const activatePos = this.activatePositions[this.spawnedCount];
    const enemy = this.enemyCreator.create(activatePos);
    enemy.startMover();
    this.scene.add(enemy.actor);
    for (const child of enemy.actor.children) {
      this.scene.add(child);
    }
    this.squad.add(enemy);

    this.spawnedCount += 1;
  }
}
