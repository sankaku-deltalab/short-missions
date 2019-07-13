<template>
  <v-app id="app">
    <Menu />
    <StageSelector />
    <GameCanvas />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Menu from "./components/Menu.vue";
import StageSelector from "./components/StageSelector.vue";
import GameCanvas from "./components/GameCanvas.vue";

@Component({
  components: {
    Menu,
    StageSelector,
    GameCanvas
  }
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
