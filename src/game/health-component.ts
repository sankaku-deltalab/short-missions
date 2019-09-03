import { EventDispatcher } from "./event-dispatcher";

/**
 * HealthComponent represent health for Character.
 */
export class HealthComponent {
  private internalHealth: number;
  private internalMaxHealth: number;
  private internalDead: boolean;
  public readonly onTakeDamage: EventDispatcher<number>;
  public readonly onHealed: EventDispatcher<number>;
  public readonly onDied: EventDispatcher<void>;
  public damageAbsorber: (originalDamage: number) => number;

  public constructor(initialHealth: number, maxHealth: number) {
    if (maxHealth <= 0) throw new Error("Max health <= 0");
    if (initialHealth > maxHealth)
      throw new Error("Initial health > max health");
    if (initialHealth <= 0) throw new Error("Initial health <= 0");

    this.internalHealth = initialHealth;
    this.internalMaxHealth = maxHealth;
    this.internalDead = false;

    this.onTakeDamage = new EventDispatcher();
    this.onHealed = new EventDispatcher();
    this.onDied = new EventDispatcher();
    this.damageAbsorber = (d: number): number => d;
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
    const absorbedDamage = this.damageAbsorber(damage);
    this.internalHealth -= absorbedDamage;
    this.onTakeDamage.dispatch(absorbedDamage);

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
    const healable = !this.isDead && healAmount > 0;
    if (!healable) {
      this.onHealed.dispatch(0);
      return;
    }

    const maxHealing = this.maxHealth - this.internalHealth;
    const healing = Math.min(maxHealing, healAmount);
    this.internalHealth += healing;

    this.onHealed.dispatch(healing);
  }

  /**
   * Kill this.
   */
  public die(): void {
    this.internalDead = true;
    this.onDied.dispatch();
  }
}
