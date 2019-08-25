import * as ex from "excalibur";
import { simpleMock } from "../../test-util";
import {
  StaticEnemyMover,
  StaticEnemyMoverArgs
} from "@/game/static-enemy-mover";
import { EnemyMoveRoute } from "@/game/enemy-move-route";
import { Character } from "@/game/character";
import { EventDispatcher } from "@/game/event-dispatcher";
import { CoordinatesConverter } from "@/game/coordinates-converter";

function createCharacterMock(cc?: CoordinatesConverter): Character {
  const coordinatesConverter =
    cc !== undefined
      ? cc
      : simpleMock<CoordinatesConverter>({
          canvasPointIsInVisualArea: jest.fn()
        });
  return simpleMock<Character>({
    actor: {
      coordinatesConverter,
      set posInArea(_: ex.Vector) {}
    }
  });
}

function createEventDispatcherMock(): EventDispatcher<void> {
  return simpleMock<EventDispatcher<void>>({
    dispatch: jest.fn()
  });
}

function createRouteMock(): EnemyMoveRoute {
  return simpleMock<EnemyMoveRoute>({
    getInitialPosition: jest.fn(),
    calcPositionInArea: jest.fn().mockReturnValue(new ex.Vector(0, 0))
  });
}

function createStaticEnemyMoverArgsMock(): StaticEnemyMoverArgs {
  return {
    route: createRouteMock(),
    onEnteredToArea: createEventDispatcherMock(),
    onExitingFromArea: createEventDispatcherMock()
  };
}

describe("StaticEnemyMover", (): void => {
  it("can set owner character", (): void => {
    // Given StaticEnemyMover
    const args = createStaticEnemyMoverArgsMock();
    const mover = new StaticEnemyMover(args);

    // And Character
    const character = createCharacterMock();

    // Then StaticEnemyMover can set character as owner
    const setOwner = (): void => {
      mover.owner = character;
    };
    expect(setOwner).not.toThrowError();
  });

  it("move owner when started to initial route position", (): void => {
    // Given StaticEnemyMover
    const args = createStaticEnemyMoverArgsMock();
    const initialPosInArea = simpleMock<ex.Vector>();
    args.route.getInitialPosition = jest
      .fn()
      .mockReturnValueOnce(initialPosInArea);
    const mover = new StaticEnemyMover(args);

    // And Character as owner
    const owner = createCharacterMock();
    const ownerSetPosInArea = jest.spyOn(owner.actor, "posInArea", "set");

    // When mover set owner
    mover.owner = owner;

    // And start mover
    mover.start();

    // Then owner actor was set posInArea
    expect(ownerSetPosInArea).toBeCalledWith(initialPosInArea);
  });

  it("move owner when updated to route position", (): void => {
    // Given StaticEnemyMover
    const args = createStaticEnemyMoverArgsMock();
    const initialPosInArea = simpleMock<ex.Vector>();
    const routePosInArea = simpleMock<ex.Vector>();
    args.route.getInitialPosition = jest
      .fn()
      .mockReturnValueOnce(initialPosInArea);
    args.route.calcPositionInArea = jest
      .fn()
      .mockReturnValueOnce(routePosInArea);
    const mover = new StaticEnemyMover(args);

    // And Character as owner
    const owner = createCharacterMock();
    const ownerSetPosInArea = jest.spyOn(owner.actor, "posInArea", "set");

    // When mover set owner
    mover.owner = owner;

    // And start mover
    mover.start();

    // And update mover
    const deltaTimeMS = 10;
    mover.update(deltaTimeMS);

    // Then StaticEnemyMover get position in area EnemyMoveRoute
    expect(args.route.calcPositionInArea).toBeCalledWith(deltaTimeMS);

    // And move character to pos
    expect(ownerSetPosInArea).toBeCalledWith(routePosInArea);
  });

  it.each`
    event                  | ownerInVisualAreaAtFirst | ownerInVisualAreaAtSecond
    ${"onEnteredToArea"}   | ${false}                 | ${true}
    ${"onExitingFromArea"} | ${true}                  | ${false}
  `(
    "dispatch $event when character into or out visual area",
    ({ event, ownerInVisualAreaAtFirst, ownerInVisualAreaAtSecond }): void => {
      // Given StaticEnemyMover
      const args = createStaticEnemyMoverArgsMock();
      const mover = new StaticEnemyMover(args);

      // And Character as owner
      const cc = simpleMock<CoordinatesConverter>({
        canvasPointIsInVisualArea: jest
          .fn()
          .mockReturnValueOnce(ownerInVisualAreaAtFirst) // Initial pos (not) in visual area
          .mockReturnValueOnce(ownerInVisualAreaAtFirst) // first update pos (not) in visual area
          .mockReturnValueOnce(ownerInVisualAreaAtSecond) // second update pos (not) in visual area
      });
      const owner = createCharacterMock(cc);
      jest.spyOn(owner.actor, "posInArea", "set");

      // When mover set owner
      mover.owner = owner;

      // And start mover
      mover.start();

      // And update mover twice
      const deltaTimeMS = 10;
      mover.update(deltaTimeMS);
      mover.update(deltaTimeMS);

      // Then event was dispatched
      const eventName = event as "onEnteredToArea" | "onExitingFromArea";
      expect(mover[eventName].dispatch).toBeCalled();
    }
  );

  // it.each`
  //   event                  | initialVisualPos           | nextVisualPos
  //   ${"onEnteredToArea"}   | ${new ex.Vector(0.6, 0.6)} | ${new ex.Vector(0.5, 0.5)}
  //   ${"onExitingFromArea"} | ${new ex.Vector(0.5, 0.5)} | ${new ex.Vector(0.6, 0.6)}
  // `(
  //   "dispatch $event when character move $nextVisualPos from $initialVisualPos",
  //   ({ event, initialVisualPos, nextVisualPos }): void => {
  //     // Given StaticEnemyMover
  //     const args = createStaticEnemyMoverArgsMock();

  //     // And EnemyMoveRoute enter to area or exit to area
  //     const initialPosInArea = cc.toAreaPoint(
  //       cc.toCanvasPointFromVisualArea(initialVisualPos)
  //     );
  //     const nextPosInArea = cc.toAreaPoint(
  //       cc.toCanvasPointFromVisualArea(nextVisualPos)
  //     );
  //     args.route = simpleMock<EnemyMoveRoute>({
  //       calcPositionInArea: jest
  //         .fn()
  //         .mockReturnValueOnce(initialPosInArea)
  //         .mockReturnValueOnce(nextPosInArea)
  //     });

  //     const mover = new StaticEnemyMover(args);

  //     // And Character
  //     const character = createCharacterMock();

  //     // When set character to mover
  //     mover.owner = character;

  //     // And start mover
  //     mover.start();

  //     // And update mover
  //     const deltaTimeMS = 10;
  //     mover.update(deltaTimeMS);

  //     // Then onEnteredToArea was dispatched
  //     const eventName = event as "onEnteredToArea" | "onExitingFromArea";
  //     expect(mover[eventName].dispatch).toBeCalled();
  //   }
  // );
});
