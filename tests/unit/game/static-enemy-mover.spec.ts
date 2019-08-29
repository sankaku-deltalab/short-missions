import * as ex from "excalibur";
import { simpleMock } from "../../test-util";
import {
  StaticEnemyMover,
  StaticEnemyMoverArgs
} from "@/game/static-enemy-mover";
import { EnemyMoveRoute } from "@/game/enemy-move-route";
import { EventDispatcher } from "@/game/event-dispatcher";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { ActorWrapper } from "@/game/actor-wrapper";

function createActorWrapperMock(cc?: CoordinatesConverter): ActorWrapper {
  const coordinatesConverter =
    cc !== undefined
      ? cc
      : simpleMock<CoordinatesConverter>({
          canvasPointIsInVisualArea: jest.fn()
        });
  return simpleMock<ActorWrapper>({
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
  it("can start with ActorWrapper", (): void => {
    // Given StaticEnemyMover
    const args = createStaticEnemyMoverArgsMock();
    const mover = new StaticEnemyMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();

    // Then StaticEnemyMover can start with owner
    const staring = (): void => {
      mover.start(wrapper);
    };
    expect(staring).not.toThrowError();
  });

  it("move owner when started to initial route position", (): void => {
    // Given StaticEnemyMover
    const args = createStaticEnemyMoverArgsMock();
    const initialPosInArea = simpleMock<ex.Vector>();
    args.route.getInitialPosition = jest
      .fn()
      .mockReturnValueOnce(initialPosInArea);
    const mover = new StaticEnemyMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();
    const ownerSetPosInArea = jest.spyOn(wrapper.actor, "posInArea", "set");

    // When start mover
    mover.start(wrapper);

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

    // And ActorWrapper
    const wrapper = createActorWrapperMock();
    const ownerSetPosInArea = jest.spyOn(wrapper.actor, "posInArea", "set");

    // When start mover
    mover.start(wrapper);

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

      // And ActorWrapper
      const cc = simpleMock<CoordinatesConverter>({
        canvasPointIsInVisualArea: jest
          .fn()
          .mockReturnValueOnce(ownerInVisualAreaAtFirst) // Initial pos (not) in visual area
          .mockReturnValueOnce(ownerInVisualAreaAtFirst) // first update pos (not) in visual area
          .mockReturnValueOnce(ownerInVisualAreaAtSecond) // second update pos (not) in visual area
      });
      const wrapper = createActorWrapperMock(cc);
      jest.spyOn(wrapper.actor, "posInArea", "set");

      // When start mover
      mover.start(wrapper);

      // And update mover twice
      const deltaTimeMS = 10;
      mover.update(deltaTimeMS);
      mover.update(deltaTimeMS);

      // Then event was dispatched
      const eventName = event as "onEnteredToArea" | "onExitingFromArea";
      expect(mover[eventName].dispatch).toBeCalled();
    }
  );
});
