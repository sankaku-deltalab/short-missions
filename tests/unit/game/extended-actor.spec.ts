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
});
