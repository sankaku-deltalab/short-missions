import { simpleMock } from "../../test-util";
import { Collisions } from "@/game/collision-groups";

export function createCollisionsMock(): Collisions {
  const collisionsClass = jest.fn<Collisions, []>(
    (): Collisions => ({
      player: simpleMock({ name: "player" }),
      playerBullet: simpleMock({ name: "playerBullet" }),
      enemy: simpleMock({ name: "enemy" }),
      enemyBullet: simpleMock({ name: "enemyBullet" }),
      item: simpleMock({ name: "item" })
    })
  );
  return new collisionsClass();
}

export function createSceneMock(): ex.Scene {
  return simpleMock<ex.Scene>({ remove: jest.fn() });
}
