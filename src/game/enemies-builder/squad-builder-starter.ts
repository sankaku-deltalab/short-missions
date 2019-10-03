import { EventDispatcher } from "../common/event-dispatcher";
import { SquadBuilder } from "./squad-builder";
import { Squad } from "./squad";

export interface SquadBuilderInfo {
  startTime: number;
  squad: Squad;
  squadBuilder: SquadBuilder;
}

export interface SquadBuilderStarterArgs {
  onFinished: EventDispatcher<void>;
  builderInfo: SquadBuilderInfo[];
}

export class SquadBuilderStarter {
  private readonly _onFinishedSpawning: EventDispatcher<void>;
  private readonly builderInfo: SquadBuilderInfo[];
  private startedCount = 0;
  private timeSinceStartMS = 0;
  private builderFinishedCount = 0;

  public constructor(args: SquadBuilderStarterArgs) {
    this._onFinishedSpawning = args.onFinished;
    this.builderInfo = args.builderInfo;
  }

  public takeStartingSquads(): Squad[] {
    return this.builderInfo.map(v => v.squad);
  }

  /**
   * Start.
   */
  public start(): void {
    this.timeSinceStartMS = 0;
    this.startedCount = 0;
    this.update(0);
  }

  /**
   * Update.
   *
   * @param deltaTimeMS Delta time in milliseconds
   */
  public update(deltaTimeMS: number): void {
    for (const info of this.builderInfo) {
      info.squadBuilder.update(deltaTimeMS);
    }

    this.timeSinceStartMS += deltaTimeMS;

    const builderNum = this.builderInfo.length;
    while (this.startedCount < builderNum) {
      const nextStartTimeMS =
        this.builderInfo[this.startedCount].startTime * 1000;
      if (nextStartTimeMS > this.timeSinceStartMS) break;

      this.startNextBuilder();
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

  private notifyFinishBuilder(): void {
    const builderNum = this.builderInfo.length;
    this.builderFinishedCount += 1;
    if (this.builderFinishedCount >= builderNum) {
      this._onFinishedSpawning.dispatch();
    }
  }

  private startNextBuilder(): void {
    const builder = this.builderInfo[this.startedCount].squadBuilder;
    builder.onFinishedSpawning((): void => {
      this.notifyFinishBuilder();
    });
    builder.start();
    this.startedCount += 1;
  }
}
