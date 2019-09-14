import { simpleMock } from "../../../test-util";
import { EventDispatcher } from "@/game/common/event-dispatcher";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";
import { ActorWrapper } from "@/game/actor/actor-wrapper";
import { NullMover, NullMoverArgs } from "@/game/mover/null-mover";

function createActorWrapperMock(): ActorWrapper {
  const coordinatesConverter = simpleMock<CoordinatesConverter>({
    canvasPointIsInVisualArea: jest.fn()
  });
  const actor = {
    coordinatesConverter,
    moveToPosInCanvas: jest.fn(),
    moveToPosInArea: jest.fn()
  };
  return simpleMock<ActorWrapper>({ actor });
}

function createEventDispatcherMock(): EventDispatcher<void> {
  return simpleMock<EventDispatcher<void>>({
    dispatch: jest.fn()
  });
}

function createNullMoverArgsMock(): NullMoverArgs {
  return {
    onEnteringToArea: createEventDispatcherMock(),
    onExitingFromArea: createEventDispatcherMock()
  };
}

describe("NullMover", (): void => {
  it("dispatch entering event", (): void => {
    // Given StaticEnemyMover
    const args = createNullMoverArgsMock();
    const mover = new NullMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();

    // When start mover
    mover.start(wrapper);

    // Then entering event was dispatched
    expect(args.onEnteringToArea.dispatch).toBeCalled();
  });

  it("did not move owner when started", (): void => {
    // Given StaticEnemyMover
    const args = createNullMoverArgsMock();
    const mover = new NullMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();

    // When start mover
    mover.start(wrapper);

    // Then owner did not be moved
    expect(wrapper.actor.moveToPosInCanvas).not.toBeCalled();
    expect(wrapper.actor.moveToPosInArea).not.toBeCalled();
  });

  it("did not move owner when updated", (): void => {
    // Given StaticEnemyMover
    const args = createNullMoverArgsMock();
    const mover = new NullMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();

    // When start mover
    mover.start(wrapper);

    // And update mover
    mover.update(10);

    // Then owner did not be moved
    expect(wrapper.actor.moveToPosInCanvas).not.toBeCalled();
    expect(wrapper.actor.moveToPosInArea).not.toBeCalled();
  });
});
