import Vue from "vue";
import App from "./App.vue";
import createRouter from "./router";
import createStore from "./store";
import * as path from "./path";
import ImageLazy from "@/components/imgae/index.vue";
import VueMeta from "vue-meta";

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
});

import "../style/index.scss";

Vue.component("image-lazy", ImageLazy);

Vue.config.productionTip = false;

export default () => {
  const router = createRouter();
  const store = createStore();
  const app = new Vue({
    router,
    store,
    render: h => h(App),
    provide: {
      path
    }
  });
  return { app, router, store };
};
