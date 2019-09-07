import { simpleMock } from "../../test-util";
import { Collisions } from "@/game/common/collision-groups";

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
  return simpleMock<ex.Scene>({
    add: jest.fn(),
    remove: jest.fn(),
    cleanupDrawTree: jest.fn(),
    updateDrawTree: jest.fn()
  });
}
