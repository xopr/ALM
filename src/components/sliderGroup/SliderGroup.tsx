import { Component } from "solid-js";

import styles from "./SliderGroup.module.css";

export type SliderGroupProps = {
  // name: string;
  // onClick?: (indexes?: number[]) => void; // TODO: index(es)
};

export const SliderGroup: Component<SliderGroupProps> = (props) => {

  return <div class={styles.sliderGroup}>
    <input type="range"/>
    <input type="range"/>
    <input type="range"/>
    <input type="range"/>
  </div>
;
};

export default SliderGroup;
