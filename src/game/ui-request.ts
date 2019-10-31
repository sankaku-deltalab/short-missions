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
}

export interface UIRequests {
  outGameUIRequest: OutGameUIRequest;
  inGameUIRequests: InGameUIRequests;
  stgPlayInfo: STGPlayInfo;
}
