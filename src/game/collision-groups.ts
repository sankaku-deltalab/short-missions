import * as ex from "excalibur";

/**
 * Collisions manage collisions.
 * In this package, do NOT use `ex.CollisionGroupManager` directory.
 */
export class Collisions {
  private static collisionGroupsWasSetup: boolean = false;

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
    Collisions.player = ex.CollisionGroupManager.create("player", 0x11100); // 1
    Collisions.playerBullet = ex.CollisionGroupManager.create(
      "playerBullet",
      0x00100
    ); // 2
    Collisions.enemy = ex.CollisionGroupManager.create("enemy", 0x00011); // 3
    Collisions.enemyBullet = ex.CollisionGroupManager.create(
      "enemyBullet",
      0x00001
    ); // 4
    Collisions.item = ex.CollisionGroupManager.create("item", 0x00001); // 5
  }
}
