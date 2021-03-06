import { EventDispatcher } from "../common/event-dispatcher";
import { Character } from "../actor/character";

export enum SquadFinishedReason {
  allMemberDied = "allMemberDied",
  allMemberDiedOrEscaped = "allMemberDiedOrEscaped"
}

enum SquadMemberStatus {
  living = "living",
  died = "died",
  escaped = "escaped"
}

/**
 * Squad contain `Character`s as member.
 * When disappear all member, squad notify it.
 */
export class Squad {
  private readonly _onAllMemberFinished: EventDispatcher<SquadFinishedReason>;
  public readonly members: Set<Character>;
  private isSquadBuilding = true;
  private membersStatus: Map<Character, SquadMemberStatus>;

  public constructor(
    onAllMemberFinished: EventDispatcher<SquadFinishedReason>
  ) {
    this._onAllMemberFinished = onAllMemberFinished;
    this.members = new Set();
    this.membersStatus = new Map();
  }

  /**
   * Add squad member.
   *
   * NOTE: Member must not be in multiple squads.
   *
   * @param member New squad member
   */
  public add(member: Character): void {
    this.membersStatus.set(member, SquadMemberStatus.living);

    member.onDied((): void => {
      this.memberWasFinished(member, SquadMemberStatus.died);
    });

    member.onExitingFromArea((): void => {
      this.memberWasFinished(member, SquadMemberStatus.escaped);
    });

    this.members.add(member);
  }

  /**
   * Notify finish member spawning to this.
   */
  public notifyFinishSpawning(): void {
    this.isSquadBuilding = false;
  }

  /**
   * Add event called when all member finished.
   *
   * @param event Event
   */
  public onAllMemberFinished(
    event: (reason: SquadFinishedReason) => void
  ): () => void {
    return this._onAllMemberFinished.add(event);
  }

  private canFinishSquad(): boolean {
    if (this.isSquadBuilding) return false;

    for (const [_, st] of this.membersStatus) {
      if (st === SquadMemberStatus.living) return false;
    }

    return true;
  }

  private memberWasFinished(
    member: Character,
    status: SquadMemberStatus
  ): void {
    if (this.membersStatus.get(member) !== SquadMemberStatus.living)
      throw new Error("Member was already finished");
    this.membersStatus.set(member, status);
    if (this.canFinishSquad()) {
      this.allMembersWasFinished();
    }
  }

  private allMembersWasFinished(): void {
    const allMemberDied = Array.from(this.membersStatus.values()).every(
      (status): boolean => status === SquadMemberStatus.died
    );
    const reason = allMemberDied
      ? SquadFinishedReason.allMemberDied
      : SquadFinishedReason.allMemberDiedOrEscaped;

    this._onAllMemberFinished.dispatch(reason);
  }
}
