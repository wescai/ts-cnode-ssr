import createApp from "./main";
import { init } from "./api";

import tunnel from "tunnel";

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: "127.0.0.1",
    port: 12639
  }
});

global.document = global.document || {};

export default (context: any) => {
  const { app, router, store } = createApp();

  init(store, agent);
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    // 设置服务器端 router 的位置
    router.push(context.url);

    router.onReady(() => {
      // This `rendered` hook is called when the app has finished rendering
      context.rendered = () => {
        // After the app is rendered, our store is now
        // filled with the state from our components.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        context.state = store.state;
      };

      resolve(app);
    }, reject);
  });
};
