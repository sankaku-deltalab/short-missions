<template>
  <v-list-item :key="id" @click="selected()">
    <v-list-item-action>
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ text }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
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
