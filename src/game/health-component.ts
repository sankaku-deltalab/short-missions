import { EventDispatcher } from "./common/event-dispatcher";

/**
 * HealthComponent represent health for Character.
 */
export class HealthComponent {
  private internalHealth: number;
  private internalMaxHealth: number;
  private internalDead: boolean;
  private readonly internalOnTakeDamage: EventDispatcher<number>;
  private readonly internalOnHealed: EventDispatcher<number>;
  private readonly internalOnDied: EventDispatcher<void>;

  public constructor(initialHealth: number, maxHealth: number) {
    if (maxHealth <= 0) throw new Error("Max health <= 0");
    if (initialHealth > maxHealth)
      throw new Error("Initial health > max health");
    if (initialHealth <= 0) throw new Error("Initial health <= 0");

    this.internalHealth = initialHealth;
    this.internalMaxHealth = maxHealth;
    this.internalDead = false;

    this.internalOnTakeDamage = new EventDispatcher();
    this.internalOnHealed = new EventDispatcher();
    this.internalOnDied = new EventDispatcher();
  }

  /**
   * Current health.
   */
  public health(): number {
    return this.internalHealth;
  }

  /**
   * Max health.
   */
  public maxHealth(): number {
    return this.internalMaxHealth;
  }

  /**
   * Is dead.
   */
  public isDead(): boolean {
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
    this.internalOnTakeDamage.dispatch(damage);

    if (this.internalHealth <= 0) {
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
    const healable = !this.isDead() && healAmount > 0;
    if (!healable) {
      this.internalOnHealed.dispatch(0);
      return;
    }

    const maxHealing = this.internalMaxHealth - this.internalHealth;
    const healing = Math.min(maxHealing, healAmount);
    this.internalHealth += healing;

    this.internalOnHealed.dispatch(healing);
  }

  /**
   * Kill this.
   */
  public die(): void {
    this.internalDead = true;
    this.internalOnDied.dispatch();
  }

  /**
   * Add event on damaged.
   *
   * @param event
   * @returns Event remover
   */
  public onTakeDamage(event: (damage: number) => void): () => void {
    return this.internalOnTakeDamage.add(event);
  }

  /**
   * Add event on healed.
   *
   * @param event
   * @returns Event remover
   */
  public onHealed(event: (amount: number) => void): () => void {
    return this.internalOnHealed.add(event);
  }

  /**
   * Add event on died.
   *
   * @param event
   * @returns Event remover
   */
  public onDied(event: () => void): () => void {
    return this.internalOnDied.add(event);
  }
}
