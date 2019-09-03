import * as ex from "excalibur";
import { simpleMock } from "../../test-util";
import { ExtendedActor } from "@/game/extended-actor";
import { CoordinatesConverter } from "@/game/coordinates-converter";
import { Collisions } from "@/game/collision-groups";
import { ActorWrapper } from "@/game/actor-wrapper";

describe("ExtendedActor", (): void => {
  it("need CoordinatesConverter and Collisions when constructed", (): void => {
    // Given CoordinatesConverter
    const coordinatesConverter = simpleMock<CoordinatesConverter>();

    // And Collisions
    const collisions = simpleMock<Collisions>();

    // When construct ExtendedActor
    const create = (): void => {
      new ExtendedActor({
        coordinatesConverter,
        collisions
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
      coordinatesConverter: simpleMock<CoordinatesConverter>(),
      collisions: simpleMock<Collisions>()
    });

    // When set wrapper to actor
    const setting = (): void => {
      actor.owner = wrapper;
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
          .mockReturnValueOnce(positions.posInVisualArea)
      });

      // And ExtendedActor
      const actor = new ExtendedActor({
        coordinatesConverter,
        collisions: simpleMock<Collisions>()
      });

      // When get position in area or visual area
      const actorPropertyTyped = actorProperty as
        | "posInArea"
        | "posInVisualArea";
      const actualPos = actor[actorPropertyTyped];

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
      toCanvasPoint: jest.fn().mockReturnValueOnce(posInCanvas)
    });

    // And ExtendedActor
    const actor = new ExtendedActor({
      coordinatesConverter,
      collisions: simpleMock<Collisions>()
    });

    // When get position in area or visual area
    actor.posInArea = new ex.Vector(3, 4);

    // Then position was get from CoordinatesConverter
    expect(actor.pos.x).toBe(posInCanvas.x);
    expect(actor.pos.y).toBe(posInCanvas.y);
  });

  it("can set pos as posInArea with CoordinatesConverter when be constructed", (): void => {
    // Given CoordinatesConverter
    const posInCanvas = { x: 1, y: 2 };
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      toCanvasPoint: jest.fn().mockReturnValue(posInCanvas)
    });

    // And ex.Vector as posInArea
    const posInArea = new ex.Vector(3, 4);

    // When construct ExtendedActor
    const actor = new ExtendedActor({
      posInArea,
      coordinatesConverter,
      collisions: simpleMock<Collisions>()
    });

    // Then position was get from CoordinatesConverter
    expect(actor.pos.x).toBe(posInCanvas.x);
    expect(actor.pos.y).toBe(posInCanvas.y);
  });

  it("can get worldPos in area with CoordinatesConverter", (): void => {
    // Given CoordinatesConverter
    const expectedPosInArea = { x: 1, y: 2 };
    const coordinatesConverter = simpleMock<CoordinatesConverter>({
      toAreaPoint: jest.fn().mockReturnValue(expectedPosInArea)
    });

    // And construct ExtendedActor
    const pos = new ex.Vector(5, 6);
    const actor = new ExtendedActor({
      coordinatesConverter,
      collisions: simpleMock<Collisions>()
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
      coordinatesConverter: simpleMock<CoordinatesConverter>(),
      collisions: simpleMock<Collisions>()
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
      coordinatesConverter: simpleMock<CoordinatesConverter>(),
      collisions: simpleMock<Collisions>()
    });

    // And ActorWrapper
    const wrapper = simpleMock<ActorWrapper>({
      update: jest.fn()
    });

    // When set wrapper to actor
    actor.owner = wrapper;

    // And update actor
    const collision = simpleMock<ex.CollisionGroup>();
    actor.setCollision(collision);

    // Then body was set collision
    expect(actor.body.collider.group).toBe(collision);
  });
});
