import { Component, createEffect, For } from "solid-js";

import styles from "./SliderGroup.module.css";
import { ChannelValues } from "../../../public/Effect";

export type SliderGroupProps = {
  // name: string;
  // onClick?: (index: number) => void;
  channels?: ChannelValues;
  channelOffset?: number;
  onValueChanged?: (index: number, value: number) => void;
};

const RES = 16384;

export const SliderGroup: Component<SliderGroupProps> = (props) => {

  return <div class="stubbornContainer vertical">
    <div class={styles.sliderGroup}>
      <For each={props.channels}>{(channel, idx) =>
        <input
          type="range"
          value={Math.round(channel.value * RES)}
          min={0}
          max={RES}
          onInput={(event) => props.onValueChanged?.(idx() + (props.channelOffset ?? 0), Number(event.target.value) / RES)}
        />
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
