import { simpleMock } from "../../../test-util";
import { BulletsPool } from "@/game/weapon/bullets-pool";
import { Bullet } from "@/game/weapon/bullet";

describe("BulletsPool", (): void => {
  it("pop bullet already pushed", (): void => {
    // Given Bullet
    const bullet = simpleMock<Bullet>();

    // And BulletsPool
    const bulletsPool = new BulletsPool();

    // When push bullet to pool
    bulletsPool.push(bullet);

    // And pop bullet from pool
    const popen = bulletsPool.pop();

    // Then popen bullet is pushed one
    expect(popen).toBe(bullet);
  });

  it("can deal my bullets", (): void => {
    // Given Bullet
    const bullet = simpleMock<Bullet>();

    // And BulletsPool
    const bulletsPool = new BulletsPool();

    // When push bullet to pool
    bulletsPool.push(bullet);

    // And get bullets
    const bullets = bulletsPool.bullets();

    // Then taken bullet is pushed one
    expect(bullets[0]).toBe(bullet);
  });

  it("can deal my bullets but array is not effect pool", (): void => {
    // Given Bullet
    const bullet = simpleMock<Bullet>();

    // And BulletsPool
    const bulletsPool = new BulletsPool();

    // When push bullet to pool
    bulletsPool.push(bullet);

    // And get bullets
    const bullets = bulletsPool.bullets();

    // And mutate bullets array
    bullets.pop();

    // Then pool was not effected
    expect(bulletsPool.pop()).toBe(bullet);
  });
});
