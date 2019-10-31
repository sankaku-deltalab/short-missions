<template>
  <v-container fluid fill-hight class="on-top">
    <v-row justify="space-between">
      <v-col cols="3">
        <v-icon v-for="_ in stgPlayInfo.health" :key="_" color="pink">
          mdi-heart
        </v-icon>
        <v-icon class="d-none">mdi-heart</v-icon>
      </v-col>
      <v-col cols="3">
        <v-btn small>Pause</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { STGPlayInfo } from "@/game/ui-request";

@Component
export default class STGUI extends Vue {
  @Prop()
  private stgPlayInfo!: STGPlayInfo;

  private message = "";
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.on-top {
  position: absolute;
}
</style>
