<template>
  <v-content app>
    <v-container>
      <v-layout>
        <v-flex xs12>
          <v-card>
            <v-list>
              <template v-for="(item, i) in missions">
                <StageItem
                  v-bind:key="i"
                  v-bind:id="item.id"
                  v-bind:title="item.title"
                  v-bind:hiScore="hiScores[item.id]"
                  @selected="missionSelected(item.id)"
                />
              </template>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop } from "vue-property-decorator";
import StageItem from "./StageItem.vue";

interface MissionData {
  id: number;
  title: string;
}

@Component({
  components: {
    StageItem
  }
})
export default class StageSelector extends Vue {
  private show = true;
  private showMenu = false;
  private missions: MissionData[] = Array(20)
    .fill(0)
    .map((_, i) => ({ id: i, title: `Mission ${i}` }));

  @Prop()
  private hiScores!: { [key: number]: number };
  private selecting = "selectMission";

  @Emit()
  private missionSelected(_selectedMissionId: number): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
