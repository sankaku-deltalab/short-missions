<template>
  <v-app id="app">
    <GameCanvas ref="game-canvas" />
    <v-fade-transition>
      <span v-show="!stgMode">
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
import { createEngine } from "@/game/engine-creator";
import { STGGameManager } from "@/game/stg-game-manager";
import { MissionFlow } from "./game/mission-flow";

@Component({
  components: {
    Menu,
    StageSelector,
    GameCanvas
  }
})
export default class App extends Vue {
  private stgMode = false;
  private stgGameManager!: STGGameManager;

  public mounted(): void {
    // Setup game
    const gameCanvas = this.$refs["game-canvas"] as GameCanvas;
    const engine = createEngine(gameCanvas.getCanvas());
    this.stgGameManager = new STGGameManager(engine);
    engine.start();
  }

  private async playMission(selectedMissionId: number): Promise<void> {
    this.stgMode = true;
    const flow = new MissionFlow(this.stgGameManager);
    await flow.playMission(selectedMissionId);
    this.stgMode = false;
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
