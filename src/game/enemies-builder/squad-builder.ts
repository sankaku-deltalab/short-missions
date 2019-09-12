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
  public readonly onFinished: EventDispatcher<void>;
  private readonly enemyCreator: EnemyCreator;
  private readonly moverCreator: StaticEnemyMoverCreator;
  private readonly activateTimeAndPositions: ActivateTimeAndPosition[];
  private readonly activateTime: number;
  private spawnedCount = 0;
  private timeSinceStartMS = 0;

  public constructor(args: SquadBuilderArgs) {
    this.scene = args.scene;
    this.squad = args.squad;
    this.onFinished = args.onFinished;
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

  private finishSpawning(): void {
    this.onFinished.dispatch();
    this.squad.notifyFinishSpawning();
  }

  private spawnNextEnemy(): void {
    // Create and setup enemy
    const activatePos = this.activateTimeAndPositions[this.spawnedCount]
      .position;
    const mover = this.moverCreator.create(activatePos);
    const enemy = this.enemyCreator.create(mover);
    enemy.startMover();
    const timer = new ex.Timer((): void => {
      const w = enemy.weapon;
      if (w !== undefined) w.startFiring();
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
