import { Bullet } from "./bullet";

export class BulletsPool {
  private readonly pooledBullets: Bullet[];

  public constructor() {
    this.pooledBullets = [];
  }

  public push(bullet: Bullet): void {
    this.pooledBullets.push(bullet);
  }

  public pop(): Bullet | undefined {
    return this.pooledBullets.pop();
  }

  public bullets(): Bullet[] {
    return [...this.pooledBullets];
  }
}
