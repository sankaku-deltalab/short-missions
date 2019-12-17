import { simpleMock } from "../../../test-util";
import { SquadBuilder } from "@/game/enemies-builder/squad-builder";
import { EventDispatcher } from "@/game/common/event-dispatcher";
import {
  SquadBuilderStarterArgs,
  SquadBuilderStarter
} from "@/game/enemies-builder/squad-builder-starter";
import { Squad } from "@/game/enemies-builder/squad";

function createSquadBuilderMock(): SquadBuilder {
  return simpleMock<SquadBuilder>({
    start: jest.fn(),
    update: jest.fn(),
    onFinishedSpawning: jest.fn()
  });
}

function createSquadBuilderStarterArgsMock(): SquadBuilderStarterArgs {
  const onFinished = new EventDispatcher<void>();
  onFinished.dispatch = jest.fn();
  return {
    onFinished,
    builderInfo: [
      {
        startTime: 0,
        squad: simpleMock<Squad>(),
        squadBuilder: createSquadBuilderMock()
      },
      {
        startTime: 1364,
        squad: simpleMock<Squad>(),
        squadBuilder: createSquadBuilderMock()
      }
    ]
  };
}

describe("SquadBuilderStarter", (): void => {
  it("start SquadBuilder", (): void => {
    // Given SquadBuilderStarter
    const args = createSquadBuilderStarterArgsMock();
    const sbs = new SquadBuilderStarter(args);

    // When start SquadBuilderStarter
    sbs.start();

    // Then start first SquadBuilder
    expect(args.builderInfo[0].squadBuilder.start).toBeCalled();
  });

  it("start SquadBuilder when updated", (): void => {
    // Given SquadBuilderStarter
    const args = createSquadBuilderStarterArgsMock();
    const sbs = new SquadBuilderStarter(args);

    // When start SquadBuilderStarter
    sbs.start();

    // And update SquadBuilderStarter
    const deltaMS = args.builderInfo[1].startTime * 1000;
    sbs.update(deltaMS);

    // Then start next SquadBuilder
    expect(args.builderInfo[1].squadBuilder.start).toBeCalled();
  });

  it("update all SquadBuilder when updated", (): void => {
    // Given SquadBuilderStarter
    const args = createSquadBuilderStarterArgsMock();
    const sbs = new SquadBuilderStarter(args);

    // When start SquadBuilderStarter
    sbs.start();

    // And update SquadBuilderStarter
    const deltaMS = 123;
    sbs.update(deltaMS);

    // Then all SquadBuilder was updated
    for (const info of args.builderInfo) {
      expect(info.squadBuilder.update).toBeCalledWith(deltaMS);
    }
  });

  it("dispatch onFinished event when all squad builder was finished", (): void => {
    // Given SquadBuilderStarter
    const args = createSquadBuilderStarterArgsMock();
    const sbs = new SquadBuilderStarter(args);

    // When start SquadBuilderStarter
    sbs.start();

    // And start all SquadBuilder
    const deltaMS = args.builderInfo[1].startTime * 1000;
    sbs.update(deltaMS);

    // And all SquadBuilder was finished
    for (const info of args.builderInfo) {
      for (const [event] of (info.squadBuilder.onFinishedSpawning as any).mock
        .calls) {
        event();
      }
    }

    // When SquadBuilderStarter was finished
    expect(args.onFinished.dispatch).toBeCalled();
  });

  it("can take squads would be started", (): void => {
    // Given SquadBuilderStarter
    const args = createSquadBuilderStarterArgsMock();
    const sbs = new SquadBuilderStarter(args);

    // Then SquadBuilderStarter can take squads
    const squads = args.builderInfo.map(v => v.squad);
    expect(sbs.startingSquads()).toEqual(squads);
  });
});
