/**
 * HealthComponent represent health for Character.
 */
export class HealthComponent {
  private internalHealth: number;
  private internalMaxHealth: number;
  private internalDead: boolean;

  public constructor(initialHealth: number, maxHealth: number) {
    if (maxHealth <= 0) throw new Error("Max health <= 0");
    if (initialHealth > maxHealth)
      throw new Error("Initial health > max health");
    if (initialHealth <= 0) throw new Error("Initial health <= 0");

    this.internalHealth = initialHealth;
    this.internalMaxHealth = maxHealth;
    this.internalDead = false;
  }

  /**
   * Current health.
   */
  public get health(): number {
    return this.internalHealth;
  }

  /**
   * Max health.
   */
  public get maxHealth(): number {
    return this.internalMaxHealth;
  }

  /**
   * Is dead.
   */
  public get isDead(): boolean {
    return this.internalDead;
  }

  /**
   * Take damage.
   *
   * @param damage Damage amount
   */
  public takeDamage(damage: number): void {
    if (damage <= 0) return;
    this.internalHealth -= damage;
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Heal damage.
   * Health is clamped by maxHealth.
   * Can not heal while dead.
   *
   * @param healAmount Heal amount
   */
  public heal(healAmount: number): void {
    if (healAmount <= 0) return;
    if (this.isDead) return;
    this.internalHealth += healAmount;
    this.internalHealth = Math.min(this.maxHealth, this.internalHealth);
  }

  /**
   * Kill this.
   */
  public die(): void {
    this.internalDead = true;
  }
}
