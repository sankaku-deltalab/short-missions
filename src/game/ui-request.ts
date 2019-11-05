import { EventDispatcher } from "./common/event-dispatcher";

export enum OutGameUIRequest {
  menu = "menu",
  pauseMenu = "pauseMenu",
  none = "none"
}

export interface InGameUIRequests {
  stgUI: boolean;
  stageClearUI: boolean;
  stageFailedUI: boolean;
}

export interface STGPlayInfo {
  healthMax: number;
  health: number;
  missionAbortEvent: EventDispatcher<void>;
}

export interface UIRequests {
  outGameUIRequest: OutGameUIRequest;
  inGameUIRequests: InGameUIRequests;
  stgPlayInfo: STGPlayInfo;
}
