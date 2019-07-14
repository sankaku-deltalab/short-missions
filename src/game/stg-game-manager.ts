import * as ex from "excalibur";

export class STGGameManager {
  public readonly engine: ex.Engine;
  private stgGameManager!: STGGameManager;

  public constructor(engine: ex.Engine) {
    this.engine = engine;
  }

  public async playMission(missionId: number): Promise<void> {
    // TODO: Setup scene
    // TODO: Setup enemy setting
    // TODO: Setup jiki
    // TODO: Setup haikei
    // TODO: Start game
    // TODO: Wait end game
    // TODO: Show result
    // TODO: Clear all
  }
}
