import { Component, createMemo } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";
import { ChannelData } from "../../public/Effect";

type ControlProps = {
  /** Effect name to display */
  name?: string;

  /** Full channel data */
  channels?: ChannelData;

  /** ChannelValues sparse array */
  onChannelValues?: (channelValues: number[]) => void;

  /** Button click handler */
  onClick?: (index: number) => void;
}


export const Control: Component<ControlProps> = (props) => {
  const group1 = createMemo(() => {
    return props.channels?.slice(0, 4);
  });
  const group2 = createMemo(() => {
    return props.channels?.slice(4, 8);
  });

  const valueChanged = (idx: number, value: number) => {
    const data = [];
    data[idx] = value;

    props.onChannelValues?.(data);
  }
  return <div id="content" class="inbetweenContainer vertical">
    <h1>Control section - {props.name ?? "None"}</h1>
    <div class="contentContainer horizontal">
      <SliderGroup channels={group1()} onValueChanged={valueChanged} onClick={props.onClick}/>
      <SliderGroup channels={group2()} onValueChanged={valueChanged} onClick={props.onClick} channelOffset={4}/>
    </div>
  </div>;
}

export default Control;
