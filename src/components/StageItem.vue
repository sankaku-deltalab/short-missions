<template>
  <v-list-item :key="id" @click="selected()">
    <v-list-item-action>
      <v-icon v-if="hiScore >= 0">mdi-check</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        <span v-if="hiScore >= 0">Hi Score: {{ hiScore }}</span>
        <span v-else>Not cleared</span>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
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
