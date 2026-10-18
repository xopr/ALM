import { Component, For } from "solid-js";
import Segment from "./Segment";
import type { DmxLightItem } from "../../types/ItemData";


export const Light: Component<DmxLightItem> = (props) => {
  return <ul class="contentContainer vertical">
      <For each={props.data}>{(segment) => <Segment {...segment} />}</For>
    </ul>;
};

export default Light;
