import createApp from "./main";
import "@/directive";
import "./common/fastclick";
import "normalize.css";
import { init as apiInit } from "./api";
const { app, router, store } = createApp();

//@ts-ignore
window.FastClick.attach(document.body); // fix click 300ms

if ((window as any).__INITIAL_STATE__) {
  store.replaceState((window as any).__INITIAL_STATE__);
}

apiInit(store, null);
router.onReady(() => {
  app.$mount("#app");
});
