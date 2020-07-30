import Vue from "vue";
import ImgView from "./img-view.vue";
let imgView = Vue.extend(ImgView);

class UImgView {
  constructor(src: string) {
    const el = document.createElement("div");
    document.body.appendChild(new imgView({ el, propsData: { src } }).$el);
  }
}

export const ViewImg = (src: string) => new UImgView(src);
