import Vue from "vue";
import { CreateElement, VNode } from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.config.productionTip = false;

new Vue({
  render: (h: CreateElement): VNode => h(App)
}).$mount("#app");
