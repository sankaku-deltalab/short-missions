import * as ex from "excalibur";
import { EventDispatcher } from "../common/event-dispatcher";
import { Squad } from "./squad";
import { EnemyCreator } from "./enemy-creator";
import { ZIndex } from "../common/z-index";
import { ActivateTimeAndPosition } from "../contents/activate-position-generator/side-enter";
import { StaticEnemyMoverCreator } from "./static-enemy-mover-creator";

export interface SquadBuilderArgs {
  squad: Squad;
  scene: ex.Scene;
  onFinished: EventDispatcher<void>;
  enemyCreator: EnemyCreator;
  moverCreator: StaticEnemyMoverCreator;
  activateTimeAndPositions: ActivateTimeAndPosition[];
  activateTime: number;
}

/**
 * 分隊を作る
 */
export class SquadBuilder {
  private readonly squad: Squad;
  private readonly scene: ex.Scene;
  private readonly _onFinishedSpawning: EventDispatcher<void>;
  private readonly enemyCreator: EnemyCreator;
  private readonly moverCreator: StaticEnemyMoverCreator;
  private readonly activateTimeAndPositions: ActivateTimeAndPosition[];
  private readonly activateTime: number;
  private spawnedCount = 0;
  private timeSinceStartMS = 0;

  public constructor(args: SquadBuilderArgs) {
    this.scene = args.scene;
    this.squad = args.squad;
    this._onFinishedSpawning = args.onFinished;
    this.enemyCreator = args.enemyCreator;
    this.moverCreator = args.moverCreator;
    this.activateTimeAndPositions = args.activateTimeAndPositions;
    this.activateTime = args.activateTime;
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
    this.timeSinceStartMS += deltaTimeMS;

    const spawnNum = this.activateTimeAndPositions.length;
    while (this.spawnedCount < spawnNum) {
      const nextSpawnTimeMS =
        this.activateTimeAndPositions[this.spawnedCount].timeSec * 1000;
      if (nextSpawnTimeMS > this.timeSinceStartMS) break;

      this.spawnNextEnemy();

      if (this.spawnedCount >= spawnNum) {
        this.finishSpawning();
      }
    }
  }

  /**
   * Add event called when all enemy was spawned.
   *
   * @param event Event
   */
  public onFinishedSpawning(event: () => void): () => void {
    return this._onFinishedSpawning.add(event);
  }

  private finishSpawning(): void {
    this._onFinishedSpawning.dispatch();
    this.squad.notifyFinishSpawning();
  }

  private spawnNextEnemy(): void {
    // Create and setup enemy
    const activatePos = this.activateTimeAndPositions[this.spawnedCount]
      .position;
    const mover = this.moverCreator.create(activatePos);
    const enemy = this.enemyCreator.create(mover);
    enemy.startMoving();
    const timer = new ex.Timer((): void => {
      enemy.startFiring();
    }, this.activateTime * 1000);
    this.scene.addTimer(timer);

    // Add enemy to scene
    this.scene.add(enemy.actor);
    for (const child of enemy.actor.children) {
      this.scene.add(child);
    }
    enemy.actor.setZIndex(ZIndex.enemy);

    this.squad.add(enemy);

    this.spawnedCount += 1;
  }
}
