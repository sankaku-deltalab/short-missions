<template>
  <v-app id="app">
    <GameCanvas ref="game-canvas" />
    <v-container fill-height v-show="sholdShowStageClearUI()">
      <v-alert>Clear!</v-alert>
    </v-container>
    <v-container fill-height v-show="sholdShowStageFailedUI()">
      <v-alert>Failed...</v-alert>
    </v-container>
    <STGUI
      v-show="sholdShowSTGUI()"
      :stg-play-info="uiRequests.stgPlayInfo"
    ></STGUI>
    <v-fade-transition>
      <span v-show="sholdShowMenu()">
        <Menu />
        <StageSelector @mission-selected="playMission" />
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
import { createEngine } from "@/game/engine-creator";
import { STGGameManager } from "@/game/stg-game-manager";
import { OutGameUIRequest, UIRequests } from "@/game/ui-request";
import { MissionFlow } from "./game/mission-flow";

@Component({
  components: {
    Menu,
    StageSelector,
    GameCanvas,
    STGUI
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
      health: 1
    }
  };

  public mounted(): void {
    // Setup game
    const gameCanvas = this.$refs["game-canvas"] as GameCanvas;
    const engine = createEngine(gameCanvas.getCanvas());
    this.stgGameManager = new STGGameManager(engine, this.uiRequests);
    this.stgGameManager.start();
  }

  public sholdShowMenu(): boolean {
    return this.uiRequests.outGameUIRequest === OutGameUIRequest.menu;
  }

  public sholdShowStageClearUI(): boolean {
    return this.uiRequests.inGameUIRequests.stageClearUI;
  }

  public sholdShowStageFailedUI(): boolean {
    return this.uiRequests.inGameUIRequests.stageFailedUI;
  }

  public sholdShowSTGUI(): boolean {
    return this.uiRequests.inGameUIRequests.stgUI;
  }

  private async playMission(selectedMissionId: number): Promise<void> {
    const flow = new MissionFlow(this.stgGameManager);
    await flow.playMission(selectedMissionId);
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
