import { Component, Index } from "solid-js";

import styles from "./SliderGroup.module.css";
import { ChannelData } from "../../../public/Effect";

export type SliderGroupProps = {
  // name: string;
  channels?: ChannelData;
  channelOffset?: number;
  onValueChanged?: (index: number, value: number) => void;
  onClick?: (index: number) => void;
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
      <Index each={props.channels}>{(channel, idx) =>
        <button onClick={() => props.onClick?.(idx + (props.channelOffset ?? 0))} class={`${styles.button} ${channel().muted ? styles.active : ""}`}>{channel().name}</button>
      }</Index>
    </div>
  </div>
);

export default SliderGroup;
