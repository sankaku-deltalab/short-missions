<template>
  <v-app id="app">
    <GameCanvas ref="game-canvas" />
    <v-container fill-height v-show="shouldShowPauseMenu()">
      <PauseMenu
        v-on:request-resume-mission="hidePauseMenu"
        v-on:request-abort-mission="abortMission"
      />
    </v-container>
    <v-container fill-height v-show="sholdShowStageClearUI()">
      <v-alert>Clear!</v-alert>
    </v-container>
    <v-container fill-height v-show="sholdShowStageFailedUI()">
      <v-alert>Failed...</v-alert>
    </v-container>
    <STGUI
      v-if="sholdShowSTGUI()"
      :stg-play-info="uiRequests.stgPlayInfo"
      v-on:request-pause="showPauseMenu"
    ></STGUI>
    <v-fade-transition>
      <span v-show="sholdShowMenu()">
        <Menu />
        <StageSelector
          v-bind:hi-scores="hiScores"
          @mission-selected="playMission"
        />
      </span>
    </v-fade-transition>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Menu from "./components/Menu.vue";
import StageSelector from "./components/StageSelector.vue";
import GameCanvas from "./components/GameCanvas.vue";
import STGUI from "./components/STGUI.vue";
import PauseMenu from "./components/PauseMenu.vue";
import { createEngine } from "@/game/engine-creator";
import { STGGameManager } from "@/game/stg-game-manager";
import { OutGameUIRequest, UIRequests } from "@/game/ui-request";
import { MissionFlow, MissionFinishReason } from "./game/mission-flow";
import { EventDispatcher } from "./game/common/event-dispatcher";
import * as hiScore from "@/game/hi-score";

@Component({
  components: {
    Menu,
    StageSelector,
    GameCanvas,
    STGUI,
    PauseMenu
  }
})
export default class App extends Vue {
  private stgGameManager!: STGGameManager;
  private uiRequests: UIRequests = {
    outGameUIRequest: OutGameUIRequest.none,
    inGameUIRequests: {
      stgUI: false,
      stageClearUI: false,
      stageFailedUI: false
    },
    stgPlayInfo: {
      healthMax: 2,
      health: 1,
      missionAbortEvent: new EventDispatcher(),
      score: 0
    }
  };
  private rate = 1;

  private readonly hiScores = hiScore.loadAllHiScore();

  public mounted(): void {
    // Setup game
    const gameCanvas = this.$refs["game-canvas"] as GameCanvas;
    const engine = createEngine(gameCanvas.getCanvas());
    this.stgGameManager = new STGGameManager(engine, this.uiRequests);
    this.stgGameManager.start();
  }

  private sholdShowMenu(): boolean {
    return this.uiRequests.outGameUIRequest === OutGameUIRequest.menu;
  }

  private sholdShowStageClearUI(): boolean {
    return this.uiRequests.inGameUIRequests.stageClearUI;
  }

  private sholdShowStageFailedUI(): boolean {
    return this.uiRequests.inGameUIRequests.stageFailedUI;
  }

  private shouldShowPauseMenu(): boolean {
    return this.uiRequests.outGameUIRequest === OutGameUIRequest.pauseMenu;
  }

  private sholdShowSTGUI(): boolean {
    return this.uiRequests.inGameUIRequests.stgUI;
  }

  private showPauseMenu(): void {
    this.uiRequests.outGameUIRequest = OutGameUIRequest.pauseMenu;
    this.stgGameManager.engine.stop();
  }

  private hidePauseMenu(): void {
    this.uiRequests.outGameUIRequest = OutGameUIRequest.none;
    this.stgGameManager.engine.start();
  }

  private abortMission(): void {
    this.uiRequests.stgPlayInfo.missionAbortEvent.dispatch();
    if (this.stgGameManager.engine.isPaused()) {
      this.stgGameManager.engine.start();
    }
  }

  private async playMission(selectedMissionId: number): Promise<void> {
    const flow = new MissionFlow(this.stgGameManager);
    const [finishReason, score] = await flow.playMission(selectedMissionId);

    // Save score
    if (finishReason === MissionFinishReason.clear) {
      const oldHiScore = hiScore.loadHiScore(selectedMissionId);
      if (score > oldHiScore) {
        hiScore.storeHiScore(selectedMissionId, score);
      }
      // Update score in UI
      this.hiScores[selectedMissionId] = score;
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
