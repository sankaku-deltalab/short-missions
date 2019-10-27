<template>
  <v-container fluid>
    <v-row align="end" class="full-size">
      <v-rating
        :length="stgPlayInfo.healthMax"
        v-model="stgPlayInfo.health"
        dense
        readonly
        full-icon="mdi-heart"
        empty-icon="mdi-heart-outline"
      ></v-rating>
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.full-size {
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
