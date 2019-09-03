import { simpleMock } from "../../test-util";
import { BulletsPool } from "@/game/bullets-pool";
import { Bullet } from "@/game/bullet";

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
});
