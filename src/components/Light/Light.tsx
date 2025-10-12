import { Component, For } from "solid-js";
import Segment, { SegmentProps } from "./Segment";
import sectionStyles from "../../sections/Section.module.css";

export type LightProps = {
  name: string,
  type: "light",
  data: SegmentProps[]
};

export const Light: Component<LightProps> = (props) => {

  return <div class={`${sectionStyles.container} ${sectionStyles.vertical} ${sectionStyles.scroll}`}>
    {/* {props.} */}
    <ul>
      <For each={props.data}>{(segment) => <Segment {...segment} />}</For>
    </ul>

  </div>
;
};

export default Light;
