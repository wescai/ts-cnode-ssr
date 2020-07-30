import Axios from "axios";
import { baseURL } from "./config";
import { toast } from "@/components/toast/index";
import { Store } from "vuex";
import { USER__LOGOUT } from "@/store/user/type";

const axios = Axios.create({
  baseURL,
  timeout: 0,
  headers: { "X-Requested-With": "XMLHttpRequest" }
  //maxContentLength: 20000
});

let isInit = false;

interface State {
  request: boolean;
}
export const init = (store: Store<State>, agent: any) => {
  if (isInit) {
    return;
  }

  isInit = true;
  let accesstoken = () => store.getters.token;
  axios.interceptors.request.use(
    config => {
      if (agent) {
        if (
          config.baseURL!.indexOf("https") !== -1 ||
          config.url!.indexOf("https") !== -1
        ) {
          config.httpsAgent = agent;
          config.proxy = false;
        }
      }
      store.commit("request", true);
      let login = !!~config.url!.indexOf("accesstoken");
      let method = config.method;
      if (method === "get" && !config.params && accesstoken()) {
        config.params = Object.assign({}, config.params, {
          accesstoken: accesstoken()
        });
      }
      if (method === "post" && !login) {
        // 登录需要传token 其他自动
        config.data = Object.assign({}, config.data, {
          accesstoken: accesstoken()
        });
      }
      return config;
    },
    error => Promise.reject(error)
  );

  axios.interceptors.response.use(
    response => {
      store.commit("request", false);
      return response;
    },
    error => {
      store.commit("request", false);
      const isServer = process.env.VUE_ENV === "server";
      if (isServer) {
        return;
      }
      const { response } = error;
      if (response && response.status === 404) {
        toast.show("API 未开放");
        return;
      }
      let message =
        (response && response.data && response.data.error_msg) || "";
      store.commit(USER__LOGOUT);
      toast.show({ message, duration: 5000 });
    }
  );
};
export const get = (url: string, params?: object) => axios.get(url, { params });

export const post = (url: string, params?: object) => axios.post(url, params);
