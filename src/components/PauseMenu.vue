<template>
  <v-overlay>
    <v-container fluid fill-hight>
      <v-row align="center">
        <v-col cols="12" class="text-center">
          <div class="ma-5">
            <v-btn @click="requestResumeMission">
              Resume
            </v-btn>
          </div>
          <div class="ma-5">
            <v-btn @click="requestAbortMission" color="error">
              Abort
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator";

@Component
export default class STGUI extends Vue {
  @Emit()
  private requestResumeMission(): void {}

  @Emit()
  private requestAbortMission(): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.on-top {
  position: absolute;
}
</style>
