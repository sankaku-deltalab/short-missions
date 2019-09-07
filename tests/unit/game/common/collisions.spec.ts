import { Collisions } from "@/game/common/collision-groups";

type collisionType =
  | "player"
  | "playerBullet"
  | "enemy"
  | "enemyBullet"
  | "item";

describe("Collisions", (): void => {
  it.each`
    group1            | group2            | collide
    ${"player"}       | ${"playerBullet"} | ${false}
    ${"player"}       | ${"enemy"}        | ${true}
    ${"player"}       | ${"enemyBullet"}  | ${true}
    ${"player"}       | ${"item"}         | ${true}
    ${"playerBullet"} | ${"playerBullet"} | ${false}
    ${"playerBullet"} | ${"enemy"}        | ${true}
    ${"playerBullet"} | ${"enemyBullet"}  | ${false}
    ${"playerBullet"} | ${"item"}         | ${false}
    ${"enemy"}        | ${"playerBullet"} | ${true}
    ${"enemy"}        | ${"enemy"}        | ${false}
    ${"enemy"}        | ${"enemyBullet"}  | ${false}
    ${"enemy"}        | ${"item"}         | ${false}
    ${"enemyBullet"}  | ${"enemyBullet"}  | ${false}
    ${"enemyBullet"}  | ${"playerBullet"} | ${false}
    ${"enemyBullet"}  | ${"item"}         | ${false}
    ${"item"}         | ${"item"}         | ${false}
  `(
    "$group1 collide with $group2 : $collide",
    ({ group1, group2, collide }): void => {
      // Given Collisions
      const collisions = new Collisions();

      // Then weapon was ticked
      const g1: collisionType = group1;
      const g2: collisionType = group2;
      const collision1 = collisions[g1];
      const collision2 = collisions[g2];
      expect(collision1.canCollide(collision2)).toBe(collide);
    }
  );
});
