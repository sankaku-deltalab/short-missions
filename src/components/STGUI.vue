<template>
  <v-container fluid fill-hight class="on-top">
    <v-row>
      <v-col cols="9">
        <v-rating
          :length="stgPlayInfo.healthMax"
          v-model="stgPlayInfo.health"
          dense
          readonly
          full-icon="mdi-heart"
          empty-icon="mdi-heart-outline"
        />
      </v-col>
      <v-col cols="3">
        <v-btn small>Pause</v-btn>
      </v-col>
    </v-row>
    <v-row>
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
