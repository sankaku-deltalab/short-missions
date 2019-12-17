<template>
  <v-container fluid fill-hight class="on-top">
    <v-row justify="space-between">
      <v-col cols="3">
        <v-icon
          v-for="_ in Math.max(0, stgPlayInfo.health)"
          :key="_"
          color="pink"
        >
          mdi-heart
        </v-icon>
        <v-icon class="d-none">mdi-heart</v-icon>
        <div>{{ `score: ${stgPlayInfo.score}` }}</div>
      </v-col>
      <v-col cols="3">
        <v-btn text icon color="yellow" @click="requestPause">
          <v-icon>mdi-pause</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { STGPlayInfo } from "@/game/ui-request";

@Component
export default class STGUI extends Vue {
  @Prop()
  private stgPlayInfo!: STGPlayInfo;

  @Emit()
  private requestPause(): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.on-top {
  position: absolute;
}
</style>
