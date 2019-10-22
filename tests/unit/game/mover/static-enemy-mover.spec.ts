import * as ex from "excalibur";
import { simpleMock } from "../../../test-util";
import {
  StaticEnemyMover,
  StaticEnemyMoverArgs
} from "@/game/mover/static-enemy-mover";
import { EnemyMoveRoute } from "@/game/mover/enemy-move-route";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";
import { ActorWrapper } from "@/game/actor/actor-wrapper";

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
      moveToPosInArea: jest.fn()
    }
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
    route: createRouteMock()
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

    // When start mover
    mover.start(wrapper);

    // Then owner actor was set posInArea
    expect(wrapper.actor.moveToPosInArea).toBeCalledWith(initialPosInArea);
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

    // When start mover
    mover.start(wrapper);

    // And update mover
    const deltaTimeMS = 10;
    mover.update(deltaTimeMS);

    // Then StaticEnemyMover get position in area EnemyMoveRoute
    expect(args.route.calcPositionInArea).toBeCalledWith(deltaTimeMS);

    // And move character to pos
    expect(wrapper.actor.moveToPosInArea).toBeCalledWith(routePosInArea);
  });
});
