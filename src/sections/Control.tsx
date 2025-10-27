import { Component, createEffect, createMemo, createSignal } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";
import { ChannelValues, Effect, IEffect } from "../../public/Effect";

type ControlProps = {
  effect?: Effect;
  instances?: IEffect[];
  channelValues?: number[];
}

export const Control: Component<ControlProps> = (props) => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  const [channelValues, setChannelValues] = createSignal<ChannelValues>([]);

  createEffect(() => {
    if (props.channelValues?.length)
      setChannelValues(
        props.effect?.channels.map((chan, idx) => ({...chan, value: props.channelValues![idx] })) as ChannelValues
  );
  });

  createEffect(() => {
    props.instances?.forEach(instance => {
      window.postMessage([instance.id, performance.now(), "channels", []] );
    })
  });

  const group1 = createMemo(() => {
    return channelValues()?.slice(0, 4);
  });
  const group2 = createMemo(() => {
    return channelValues()?.slice(4, 8);
  });

  const valueChanged = (idx: number, value: number) => {
    props.instances?.forEach(instance => {
      // Set sparse array and post
      const data = [];
      data[idx] = value;
      window.postMessage([instance.id, performance.now(), "channels", data] );
    })
  }
  return <div id="content" class="inbetweenContainer vertical">
    <h1>Control section - [{props.effect?.name}]</h1>
    <div class="contentContainer horizontal">
      <SliderGroup channels={group1()} onValueChanged={valueChanged}/>
      <SliderGroup channels={group2()} onValueChanged={valueChanged} channelOffset={4}/>
    </div>

    List effect channel preset for current (group) effect
    Affected lights: {props.instances?.length}<br/>
    channels: {channelValues().length}
    TODO: map channel names on top of each other
    OR: ignore the other effect tree!
  </div>;
}

export default Control;
