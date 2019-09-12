import { EventDispatcher } from "../common/event-dispatcher";
import { SquadBuilder } from "./squad-builder";
import { Squad } from "./squad";

export interface SquadBuilderInfo {
  startTime: number;
  squadBuilder: SquadBuilder;
}

export interface SquadBuilderStarterArgs {
  onFinished: EventDispatcher<void>;
  squads: Squad[];
  builderInfo: SquadBuilderInfo[];
}

// TODO: Starter must handle squad.onAllMembersFinished
export class SquadBuilderStarter {
  public readonly onFinished: EventDispatcher<void>;
  private readonly squads: Squad[];
  private readonly builderInfo: SquadBuilderInfo[];
  private startedCount = 0;
  private timeSinceStartMS = 0;
  private builderFinishedCount = 0;

  public constructor(args: SquadBuilderStarterArgs) {
    this.onFinished = args.onFinished;
    this.squads = args.squads;
    this.builderInfo = args.builderInfo;
  }

  public takeStartingSquads(): Squad[] {
    return this.squads.map(v => v);
  }

  /**
   * Start.
   */
  public start(): void {
    this.timeSinceStartMS = 0;
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

  private notifyFinishBuilder(): void {
    const builderNum = this.builderInfo.length;
    this.builderFinishedCount += 1;
    if (this.builderFinishedCount >= builderNum) {
      this.onFinished.dispatch();
    }
  }

  private startNextBuilder(): void {
    const builder = this.builderInfo[this.startedCount].squadBuilder;
    builder.onFinished.add((): void => {
      this.notifyFinishBuilder();
    });
    builder.start();
    this.startedCount += 1;
  }
}
