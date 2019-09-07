import * as ex from "excalibur";

/**
 * Collisions manage collisions.
 * In this package, do NOT use `ex.CollisionGroupManager` directory.
 */
export class Collisions {
  private static collisionGroupsWasSetup = false;

  private static player: ex.CollisionGroup;
  private static playerBullet: ex.CollisionGroup;
  private static enemy: ex.CollisionGroup;
  private static enemyBullet: ex.CollisionGroup;
  private static item: ex.CollisionGroup;

  public constructor() {
    Collisions.setupCollisionGroups();
  }

  public get player(): ex.CollisionGroup {
    return Collisions.player;
  }

  public get playerBullet(): ex.CollisionGroup {
    return Collisions.playerBullet;
  }

  public get enemy(): ex.CollisionGroup {
    return Collisions.enemy;
  }

  public get enemyBullet(): ex.CollisionGroup {
    return Collisions.enemyBullet;
  }

  public get item(): ex.CollisionGroup {
    return Collisions.item;
  }

  private static setupCollisionGroups(): void {
    if (Collisions.collisionGroupsWasSetup) return;

    Collisions.collisionGroupsWasSetup = true;
    Collisions.player = ex.CollisionGroupManager.create("player", 4 + 8 + 16); // 1
    Collisions.playerBullet = ex.CollisionGroupManager.create(
      "playerBullet",
      4
    ); // 2
    Collisions.enemy = ex.CollisionGroupManager.create("enemy", 1 + 2); // 4
    Collisions.enemyBullet = ex.CollisionGroupManager.create("enemyBullet", 1); // 8
    Collisions.item = ex.CollisionGroupManager.create("item", 1); // 16
  }
}
