import { Component, createEffect, For, on } from "solid-js";

import styles from "./SliderGroup.module.css";
import { ChannelValues } from "../../../public/Effect";
import { createStore } from "solid-js/store";

export type SliderGroupProps = {
  // name: string;
  // onClick?: (index: number) => void;
  channels?: ChannelValues;
  channelOffset?: number;
  onValueChanged?: (index: number, value: number) => void;
};

const RES = 16384;

export const SliderGroup: Component<SliderGroupProps> = (props) => {
  // Use store so we can set individual values that don't trigger a redraw
  const [channels, setChannels] = createStore<ChannelValues>([]);

  createEffect(on(
    () => props.channels,
    (channels, oldChannels) => {
      if (!channels?.length) {
        setChannels([]);
        return;
      }

      // Newly set; copy all and return
      if (!oldChannels) {
        setChannels(channels);
        return;
      }
      // NOTE: this triggers an error -> c is undefined
      channels.forEach((c, i) => {
        setChannels(i,"name", c.name);
        setChannels(i,"default", c.default);
        setChannels(i,"description", c.description);
        setChannels(i,"value", c.value);
      });
  }));

  return <div class="stubbornContainer vertical">
    <div class={styles.sliderGroup}>
      <For each={channels}>{(channel, idx) =>
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
      <For each={props.channels}>{(channel) =>
        <button style="width: 25%">{channel.name}</button>
      }</For>
    </div>
  </div>;
};

export default SliderGroup;
