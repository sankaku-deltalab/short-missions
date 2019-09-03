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
                  v-bind:hiScore="item.hiScore"
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
import { Component, Emit, Vue } from "vue-property-decorator";
import StageItem from "./StageItem.vue";

interface MissionData {
  id: number;
  title: string;
  hiScore: number;
}

@Component({
  components: {
    StageItem
  }
})
export default class StageSelector extends Vue {
  private show = true;
  private showMenu = false;
  private missions: MissionData[] = [
    { id: 0, title: "First mission", hiScore: -1 },
    { id: 1, title: "Second mission", hiScore: 10 }
  ];
  private selecting = "selectMission";

  @Emit()
  private missionSelected(_selectedMissionId: number): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
