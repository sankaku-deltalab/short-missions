import { simpleMock } from "../../test-util";
import { Squad, SquadFinishedReason } from "@/game/squad";
import { EventDispatcher } from "@/game/event-dispatcher";
import { Character } from "@/game/character";
import { ExtendedActor } from "@/game/extended-actor";
import { Mover } from "@/game/mover";
import { HealthComponent } from "@/game/health-component";

function createEnemyMock(): Character {
  const actor = simpleMock<ExtendedActor>();
  const health = simpleMock<HealthComponent>({
    onDied: new EventDispatcher<void>()
  });
  const mover = simpleMock<Mover>({
    onExitingFromArea: new EventDispatcher<void>()
  });
  return simpleMock<Character>({
    actor,
    health,
    mover
  });
}

function createOnFinishedMock(): EventDispatcher<SquadFinishedReason> {
  return simpleMock<EventDispatcher<SquadFinishedReason>>({
    dispatch: jest.fn()
  });
}

describe("Squad", (): void => {
  it("can add enemy character as member", (): void => {
    // Given Squad
    const squad = new Squad(createOnFinishedMock());

    // And enemy character
    const enemy = createEnemyMock();

    // When add enemy as member
    squad.add(enemy);

    // Then enemy added to member
    expect(squad.members.has(enemy)).toBe(true);
  });

  it("notify died all members when all member are died", (): void => {
    // Given Squad
    const onFinished = createOnFinishedMock();
    const squad = new Squad(onFinished);

    // And enemy characters
    const enemyNum = 10;
    const enemies = Array(enemyNum)
      .fill(0)
      .map(
        (): Character => {
          return createEnemyMock();
        }
      );

    // When add all enemy as member
    for (const enemy of enemies) {
      squad.add(enemy);
    }

    // And notify finish spawning to squad
    squad.notifyFinishSpawning();

    // And all enemy was died
    for (const enemy of enemies) {
      enemy.health.onDied.dispatch();
    }

    // Then squad notify all member died
    expect(onFinished.dispatch).toBeCalledWith(
      SquadFinishedReason.allMemberDied
    );
  });

  it("notify escaped all members when at least one of member was escaped and other members are escaped or died", (): void => {
    // Given Squad
    const onFinished = createOnFinishedMock();
    const squad = new Squad(onFinished);

    // And enemy characters
    const enemyNum = 10;
    const escapingEnemy = createEnemyMock();
    const dyingEnemies = Array(enemyNum)
      .fill(0)
      .map(
        (): Character => {
          return createEnemyMock();
        }
      );

    // When add all enemy as member
    squad.add(escapingEnemy);
    for (const enemy of dyingEnemies) {
      squad.add(enemy);
    }

    // And notify finish spawning to squad
    squad.notifyFinishSpawning();

    // And one of member was escaped
    escapingEnemy.mover.onExitingFromArea.dispatch();

    // And other enemy was died
    for (const enemy of dyingEnemies) {
      enemy.health.onDied.dispatch();
    }

    // Then squad notify escaped
    expect(onFinished.dispatch).toBeCalledWith(
      SquadFinishedReason.allMemberDiedOrEscaped
    );
  });

  it("can not finish while not finished member spawning", (): void => {
    // Given Squad
    const onFinished = createOnFinishedMock();
    const squad = new Squad(onFinished);

    // And enemy characters
    const enemyNum = 10;
    const enemies = Array(enemyNum)
      .fill(0)
      .map(
        (): Character => {
          return createEnemyMock();
        }
      );

    // When add all enemy as member
    for (const enemy of enemies) {
      squad.add(enemy);
    }

    // And NOT notify finish spawning to squad

    // And all enemy was died
    for (const enemy of enemies) {
      enemy.health.onDied.dispatch();
    }

    // Then squad NOT notify all member died
    expect(onFinished.dispatch).not.toBeCalled();
  });

  it("throw error if member was finished twice", (): void => {
    // Given Squad
    const squad = new Squad(createOnFinishedMock());

    // And enemy character
    const enemy = createEnemyMock();

    // When add enemy as member
    squad.add(enemy);

    // And enemy was escaped and died
    const finishTwice = (): void => {
      enemy.mover.onExitingFromArea.dispatch();
      enemy.health.onDied.dispatch();
    };

    // Then throw error
    expect(finishTwice).toThrowError();
  });
});
