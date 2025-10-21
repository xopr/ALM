import { Component, createMemo } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";
import { ChannelValues, Effect, IEffect } from "../../public/Effect";

type ControlProps = {
  effect?: Effect;
  instances?: IEffect[];
}

export const Control: Component<ControlProps> = (props) => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  const channelValues = createMemo(() => {
    return props.effect?.channels.map((chan, idx) => ({...chan, value: props.instances?.[0].channelValues[idx] })) as ChannelValues;
  });
  const group1 = createMemo(() => {
    return channelValues()?.slice(0, 4);
  });
  const group2 = createMemo(() => {
    return channelValues()?.slice(4, 8);
  });
  return <div id="content" class="inbetweenContainer vertical">
    <h1>Control section - [{props.effect?.name}]</h1>
    <div class="contentContainer horizontal">
      <SliderGroup channels={group1()}/>
      <SliderGroup channels={group2()}/>            
    </div>

    {}
    List effect channel preset for current (group) effect
    Affected lights: {props.instances?.length}<br/>
    channels: {props.instances?.[0]?.channelValues.length}
    TODO: map channel names on top of each other
    OR: ignore the other effect tree!
  </div>;
}

export default Control;
