import * as ex from "excalibur";
import { simpleMock } from "../../../test-util";
import { ExtendedActor } from "@/game/actor/extended-actor";
import { CoordinatesConverter } from "@/game/common/coordinates-converter";
import { Collisions } from "@/game/common/collision-groups";
import { ActorWrapper } from "@/game/actor/actor-wrapper";
import { EventDispatcher } from "@/game/common/event-dispatcher";

describe("ExtendedActor", (): void => {
  it("need CoordinatesConverter and Collisions when constructed", (): void => {
    // Given CoordinatesConverter
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
    });

    // And Collisions
    const collisions = simpleMock<Collisions>();

    // When construct ExtendedActor
    const create = (): void => {
      new ExtendedActor({
        coordinatesConverter,
        collisions,
        onEnteringToArea: new EventDispatcher(),
        onExitingFromArea: new EventDispatcher()
      });
    };

    // Then not throw error
    expect(create).not.toThrowError();
  });

  it("can set owner wrapper", (): void => {
    // Given ActorWrapper
    const wrapper = simpleMock<ActorWrapper>();

    // And ExtendedActor
    const actor = new ExtendedActor({
      coordinatesConverter: simpleMock<CoordinatesConverter>({
        canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
      }),
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });

    // When set wrapper to actor
    const setting = (): void => {
      actor.useSelfInWrapper(wrapper);
    };

    // Then not throw error
    expect(setting).not.toThrowError();
  });

  it.each`
    actorProperty
    ${"posInArea"}
    ${"posInVisualArea"}
  `(
    "can get $actorProperty from CoordinatesConverter",
    ({ actorProperty }): void => {
      // Given CoordinatesConverter
      const positions = {
        posInArea: { x: 1, y: 2 },
        posInVisualArea: { x: 3, y: 4 }
      };
      const coordinatesConverter = simpleMock<CoordinatesConverter>({
        toAreaPoint: jest.fn().mockReturnValueOnce(positions.posInArea),
        toVisualAreaPoint: jest
          .fn()
          .mockReturnValueOnce(positions.posInVisualArea),
        canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
      });

      // And ExtendedActor
      const actor = new ExtendedActor({
        coordinatesConverter,
        collisions: simpleMock<Collisions>(),
        onEnteringToArea: new EventDispatcher(),
        onExitingFromArea: new EventDispatcher()
      });

      // When get position in area or visual area
      const actorPropertyTyped = actorProperty as
        | "posInArea"
        | "posInVisualArea";
      const actualPos = actor[actorPropertyTyped]();

      // Then position was get from CoordinatesConverter
      const expectedPos = positions[actorPropertyTyped];
      expect(actualPos.x).toBe(expectedPos.x);
      expect(actualPos.y).toBe(expectedPos.y);
    }
  );

  it("can set pos as posInArea with CoordinatesConverter", (): void => {
    // Given CoordinatesConverter
    const posInCanvas = { x: 1, y: 2 };
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      toCanvasPoint: jest.fn().mockReturnValueOnce(posInCanvas),
      canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
    });

    // And ExtendedActor
    const actor = new ExtendedActor({
      coordinatesConverter,
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });

    // When move position in area
    actor.moveToPosInArea(new ex.Vector(3, 4));

    // Then position was get from CoordinatesConverter
    expect(actor.pos.x).toBe(posInCanvas.x);
    expect(actor.pos.y).toBe(posInCanvas.y);
  });

  it("can set pos as posInArea with CoordinatesConverter when be constructed", (): void => {
    // Given CoordinatesConverter
    const posInCanvas = { x: 1, y: 2 };
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      toCanvasPoint: jest.fn().mockReturnValue(posInCanvas),
      canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
    });

    // And ex.Vector as posInArea
    const posInArea = new ex.Vector(3, 4);

    // When construct ExtendedActor
    const actor = new ExtendedActor({
      posInArea,
      coordinatesConverter,
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });

    // Then position was get from CoordinatesConverter
    expect(actor.pos.x).toBe(posInCanvas.x);
    expect(actor.pos.y).toBe(posInCanvas.y);
  });

  it("can get worldPos in area with CoordinatesConverter", (): void => {
    // Given CoordinatesConverter
    const expectedPosInArea = { x: 1, y: 2 };
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      toAreaPoint: jest.fn().mockReturnValue(expectedPosInArea),
      canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
    });

    // And construct ExtendedActor
    const pos = new ex.Vector(5, 6);
    const actor = new ExtendedActor({
      coordinatesConverter,
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });
    actor.getWorldPos = jest.fn().mockReturnValueOnce(pos);

    // When get worldPosInArea
    const worldPosInArea = actor.getWorldPosInArea();

    // Then position was get from CoordinatesConverter
    expect(coordinatesConverter.toAreaPoint).toBeCalledWith(pos);
    expect(worldPosInArea.x).toBe(expectedPosInArea.x);
    expect(worldPosInArea.y).toBe(expectedPosInArea.y);
  });

  it("can set collision", (): void => {
    // Given ExtendedActor
    const actor = new ExtendedActor({
      coordinatesConverter: simpleMock<CoordinatesConverter>({
        canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
      }),
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });

    // When set collision
    const collision = simpleMock<ex.CollisionGroup>();
    actor.setCollision(collision);

    // Then body was set collision
    expect(actor.body.collider.group).toBe(collision);
  });

  it("update owner when updated", (): void => {
    // Given ExtendedActor
    const actor = new ExtendedActor({
      coordinatesConverter: simpleMock<CoordinatesConverter>({
        canvasPointIsInVisualArea: jest.fn().mockReturnValue(true)
      }),
      collisions: simpleMock<Collisions>(),
      onEnteringToArea: new EventDispatcher(),
      onExitingFromArea: new EventDispatcher()
    });

    // And ActorWrapper
    const wrapper = simpleMock<ActorWrapper>({
      update: jest.fn()
    });

    // When set wrapper to actor
    actor.useSelfInWrapper(wrapper);

    // And update actor
    const collision = simpleMock<ex.CollisionGroup>();
    actor.setCollision(collision);

    // Then body was set collision
    expect(actor.body.collider.group).toBe(collision);
  });

  it.each`
    event                  | isInVisualAreaAtFirst | isInVisualAreaAtSecond
    ${"onEnteringToArea"}  | ${false}              | ${true}
    ${"onExitingFromArea"} | ${true}               | ${false}
  `(
    "dispatch onEnteringToArea when actor into or out visual area",
    ({ event, isInVisualAreaAtFirst, isInVisualAreaAtSecond }): void => {
      // Given ExtendedActor (not) in visual area
      const cc = new CoordinatesConverter({
        areaSizeInCanvas: 100,
        centerInCanvas: { x: 50, y: 50 },
        visualAreaSizeInCanvas: { x: 100, y: 100 }
      });
      const args = {
        coordinatesConverter: cc,
        collisions: simpleMock<Collisions>(),
        onEnteringToArea: simpleMock<EventDispatcher<void>>({
          dispatch: jest.fn()
        }),
        onExitingFromArea: simpleMock<EventDispatcher<void>>({
          dispatch: jest.fn()
        })
      };

      const actor = new ExtendedActor(args);

      // When move actor to (not) in visual area
      if (isInVisualAreaAtFirst) {
        actor.moveToPosInCanvas(new ex.Vector(0, 0));
      } else {
        actor.moveToPosInCanvas(new ex.Vector(101, 101));
      }
      actor.update(simpleMock(), 1);

      if (isInVisualAreaAtSecond) {
        actor.moveToPosInCanvas(new ex.Vector(0, 0));
      } else {
        actor.moveToPosInCanvas(new ex.Vector(101, 101));
      }
      actor.update(simpleMock(), 1);

      // Then event was dispatched
      const ev = event as ("onEnteringToArea" | "onExitingFromArea");
      expect(args[ev].dispatch).toBeCalled();
    }
  );
});
