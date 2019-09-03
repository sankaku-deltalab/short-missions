<template>
  <v-layout>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="showMenu = !showMenu"></v-app-bar-nav-icon>
      <v-toolbar-title>Short Missions</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer app v-model="showMenu">
      <v-list>
        <template v-for="(item, i) in menuItems">
          <v-divider v-if="i !== 0" :key="i + 'div'" />
          <MenuItem
            v-bind:key="i"
            v-bind:id="item.id"
            v-bind:icon="item.icon"
            v-bind:text="item.text"
            @selected="menuSelected(item.id)"
          />
        </template>
      </v-list>
    </v-navigation-drawer>
  </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Vue } from "vue-property-decorator";
import MenuItem from "./MenuItem.vue";

interface MenuItemData {
  id: string;
  icon: string;
  text: string;
}

@Component({
  components: {
    MenuItem
  }
})
export default class Menu extends Vue {
  private showMenu: boolean = false;
  private menuItems: MenuItemData[] = [
    { id: "selectMission", icon: "mdi-view-list", text: "Select Mission" }
  ];
  private selecting: string = "selectMission";

  @Emit()
  private menuSelected(_selectedMenuId: string): void {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
