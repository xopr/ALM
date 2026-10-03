import { Component, Index } from "solid-js";

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

export const SliderGroup: Component<SliderGroupProps> = (props) => (
  <div class="stubbornContainer vertical">
    <div class={styles.sliderGroup}>
      <Index each={props.channels}>{(channel, idx) =>
        <input
          type="range"
          value={Math.round(channel().value * RES)}
          min={0}
          max={RES}
          onInput={(event) => props.onValueChanged?.(idx + (props.channelOffset ?? 0), Number(event.target.value) / RES)}
        />
      }</Index>
    </div>
    <div class="stubbornContainer horizontal" style={{
      // "justify-content": "space-around",
    }}>
      <Index each={props.channels}>{(channel) =>
        <button style="width: 25%">{channel().name}</button>
      }</Index>
    </div>
  </div>
);

export default SliderGroup;
