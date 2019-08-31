import * as ex from "excalibur";
import { simpleMock } from "../../test-util";
import { EventDispatcher } from "@/game/event-dispatcher";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { ActorWrapper } from "@/game/actor-wrapper";
import { NullMover, NullMoverArgs } from "@/game/null-mover";

function createActorWrapperMock(): ActorWrapper {
  const coordinatesConverter = simpleMock<CoordinatesConverter>({
    canvasPointIsInVisualArea: jest.fn()
  });
  const actor = {
    coordinatesConverter,
    set pos(_: ex.Vector) {},
    set posInArea(_: ex.Vector) {}
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
  it("did not move owner when started", (): void => {
    // Given StaticEnemyMover
    const args = createNullMoverArgsMock();
    const mover = new NullMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();
    const setPos = jest.spyOn(wrapper.actor, "pos", "set");
    const setPosInArea = jest.spyOn(wrapper.actor, "posInArea", "set");

    // When start mover
    mover.start(wrapper);

    // Then owner did not be moved
    expect(setPos).not.toBeCalled();
    expect(setPosInArea).not.toBeCalled();
  });

  it("did not move owner when updated", (): void => {
    // Given StaticEnemyMover
    const args = createNullMoverArgsMock();
    const mover = new NullMover(args);

    // And ActorWrapper
    const wrapper = createActorWrapperMock();
    const setPos = jest.spyOn(wrapper.actor, "pos", "set");
    const setPosInArea = jest.spyOn(wrapper.actor, "posInArea", "set");

    // When start mover
    mover.start(wrapper);

    // And update mover
    mover.update(10);

    // Then owner did not be moved
    expect(setPos).not.toBeCalled();
    expect(setPosInArea).not.toBeCalled();
  });
});
