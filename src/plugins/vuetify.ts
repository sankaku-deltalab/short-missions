import Vue from "vue";
import Vuetify from "vuetify/lib";
import ja from "vuetify/src/locale/ja";

Vue.use(Vuetify);

export default new Vuetify({
  options: {
    customProperties: true
  },
  iconfont: "md",
  lang: {
    locales: { ja },
    current: "ja"
  }
});
