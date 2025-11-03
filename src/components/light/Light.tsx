import { Component, For } from "solid-js";
import Segment, { SegmentProps } from "./Segment";
import sectionStyles from "../../sections/Section.module.css";

export type LightProps = {
  name: string,
  type: "light",
  data: SegmentProps[]
};

export const Light: Component<LightProps> = (props) => {
  return <ul class="contentContainer vertical">
      <For each={props.data}>{(segment) => <Segment {...segment} />}</For>
    </ul>;
};

export default Light;
