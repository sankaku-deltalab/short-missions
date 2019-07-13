<template>
  <v-list-tile :key="id" @click="selected()">
    <v-list-tile-action>
      <v-icon v-if="hiScore >= 0">done</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ title }}
      </v-list-tile-title>
      <v-list-tile-sub-title>
        <span v-if="hiScore >= 0">Hi Score: {{ hiScore }}</span>
        <span v-else>Not cleared</span>
      </v-list-tile-sub-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class MenuItem extends Vue {
  @Prop() id!: number;
  @Prop() title!: string;
  @Prop() hiScore!: number;

  @Emit()
  private selected(): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
