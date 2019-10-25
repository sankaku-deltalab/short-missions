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

export interface UIRequests {
  outGameUIRequest: OutGameUIRequest;
  inGameUIRequests: InGameUIRequests;
}
