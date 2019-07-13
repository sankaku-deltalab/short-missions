<template>
  <v-list-tile :key="id" @click="selected()">
    <v-list-tile-action>
      <v-icon>{{ icon }}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ text }}
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class MenuItem extends Vue {
  @Prop() id!: string;
  @Prop() icon!: string;
  @Prop() text!: string;

  @Emit()
  private selected(): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
