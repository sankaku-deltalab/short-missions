<template>
  <canvas class="game-canvas" ref="game-canvas" />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Canvas extends Vue {
  private canvas!: HTMLCanvasElement;

  public mounted(): void {
    const h = window.innerHeight;
    const w = window.innerWidth;
    this.canvas = this.$refs["game-canvas"] as HTMLCanvasElement;
    this.canvas.width = w;
    this.canvas.height = h;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.game-canvas {
  position: fixed;
  top: 0px;
  left: 0px;
  margin: 0px;
  padding: 0px;
  border: 0px;
  height: 100%;
  width: 100%;
}
</style>
