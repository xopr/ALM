import { Component, createEffect, For } from "solid-js";

import styles from "./SliderGroup.module.css";
import { ChannelValues } from "../../../public/Effect";

export type SliderGroupProps = {
  // name: string;
  // onClick?: (indexes?: number[]) => void; // TODO: index(es)
  channels?: ChannelValues;
  onValueChanged?: (index: number, value: number) => void;
};

export const SliderGroup: Component<SliderGroupProps> = (props) => {

  return <div class="stubbornContainer vertical">
    <div class={styles.sliderGroup}>
      <For each={props.channels}>{(channel, idx) =>
        <input type="range" value={channel.value} onchange={(event) => props.onValueChanged?.(idx(), Number(event.target.value))}/>
      }</For>
    </div>
    <div class="stubbornContainer horizontal" style={{
      // "justify-content": "space-around",
    }}>
      <For each={props.channels}>{(channel, idx) =>
        <button style="width: 25%">{channel.name}</button>
      }</For>
    </div>
  </div>;
};

export default SliderGroup;
