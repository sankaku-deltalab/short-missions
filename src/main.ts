import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import { CreateElement, VNode } from "vue";

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: (h: CreateElement): VNode => h(App)
}).$mount("#app");
