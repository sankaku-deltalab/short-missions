import { HealthComponent } from "@/game/health-component";

describe("HealthComponent", (): void => {
  it.each`
    maxHealth
    ${0}
    ${-1}
  `("throw error when max health <= 0", ({ maxHealth }): void => {
    // Given HealthComponent
    const initialHealth = 1;

    // When create HealthComponent with max health <= 0
    const create = (): void => {
      new HealthComponent(initialHealth, maxHealth);
    };

    // Then throw error
    expect(create).toThrowError();
  });

  it.each`
    initialHealth
    ${0}
    ${-1}
  `("throw error when initial health <= 0", ({ initialHealth }): void => {
    // Given HealthComponent
    const maxHealth = 200;

    // When create HealthComponent with initial health <= 0
    const create = (): void => {
      new HealthComponent(initialHealth, maxHealth);
    };

    // Then throw error
    expect(create).toThrowError();
  });

  it.each`
    initialHealth | maxHealth
    ${2}          | ${1}
  `(
    "throw error when initial health > max health",
    ({ initialHealth, maxHealth }): void => {
      // When create HealthComponent with initial health > max health
      const create = (): void => {
        new HealthComponent(initialHealth, maxHealth);
      };

      // Then throw error
      expect(create).toThrowError();
    }
  );

  it("can take damage", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When damage
    const damage = 50;
    healthComponent.takeDamage(damage);

    // Then health was subtracted
    expect(healthComponent.health()).toBe(initialHealth - damage);
  });

  it.each`
    initialHealth | maxHealth | healAmount | expectedHealth
    ${100}        | ${200}    | ${50}      | ${150}
    ${100}        | ${100}    | ${50}      | ${100}
    ${90}         | ${100}    | ${50}      | ${100}
    ${90}         | ${100}    | ${-1}      | ${90}
  `(
    "can heal",
    ({ initialHealth, maxHealth, healAmount, expectedHealth }): void => {
      // Given HealthComponent
      const healthComponent = new HealthComponent(initialHealth, maxHealth);

      // When heal
      healthComponent.heal(healAmount);

      // Then health was added
      expect(healthComponent.health()).toBe(expectedHealth);
    }
  );

  it("die when consume all health", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When damage grater or equal than initial health
    const damage = initialHealth;
    healthComponent.takeDamage(damage);

    // Then healthComponent was dead
    expect(healthComponent.isDead()).toBe(true);
  });

  it("can not heal while died", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When damage equal to initial health
    const damage = initialHealth;
    healthComponent.takeDamage(damage);

    // And heal
    const healAmount = 500;
    healthComponent.heal(healAmount);

    // Then health was not added
    expect(healthComponent.health()).toBe(0);
  });

  it("can die directory", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When die healthComponent
    const damage = initialHealth;
    healthComponent.takeDamage(damage);

    // Then healthComponent was dead
    expect(healthComponent.isDead()).toBe(true);
  });

  it("use callback when damaged", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When set callback
    const onTakeDamageFunc = jest.fn();
    healthComponent.onTakeDamage((damage: number): void => {
      onTakeDamageFunc(damage);
    });

    // And damage
    const damage = 50;
    healthComponent.takeDamage(damage);

    // Then callback was called
    expect(onTakeDamageFunc).toBeCalledWith(damage);
  });

  it.each`
    initialHealth | maxHealth | healAmount | expectedHealed
    ${100}        | ${200}    | ${50}      | ${50}
    ${100}        | ${100}    | ${50}      | ${0}
    ${90}         | ${100}    | ${50}      | ${10}
    ${90}         | ${100}    | ${-1}      | ${0}
  `(
    "use callback when healed",
    ({ initialHealth, maxHealth, healAmount, expectedHealed }): void => {
      // Given HealthComponent
      const healthComponent = new HealthComponent(initialHealth, maxHealth);

      // When set callback
      const onHealedFunc = jest.fn();
      healthComponent.onHealed((healed: number): void => {
        onHealedFunc(healed);
      });

      // And heal
      healthComponent.heal(healAmount);

      // Then callback was called
      expect(onHealedFunc).toBeCalledWith(expectedHealed);
    }
  );

  it("use callback when died", (): void => {
    // Given HealthComponent
    const initialHealth = 100;
    const maxHealth = 200;
    const healthComponent = new HealthComponent(initialHealth, maxHealth);

    // When set callback
    const onDiedFunc = jest.fn();
    healthComponent.onDied((): void => {
      onDiedFunc();
    });

    // When damage grater or equal than initial health
    const damage = initialHealth;
    healthComponent.takeDamage(damage);

    // Then callback was called
    expect(onDiedFunc).toBeCalled();
  });
});
