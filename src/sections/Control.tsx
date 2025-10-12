import { Component } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";
import { IEffect } from "../../public/Effect";

type ControlProps = {
  effectName?: string;
  effect?: IEffect;
}

export const Control: Component<ControlProps> = (props) => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  return <>
    <h1>Control section - [{props.effectName}]</h1>
    <div>
      <SliderGroup/>
      <SliderGroup/>            
    </div>
    List effect channel preset for current (group) effect
    channels: {props.effect?.channels.length}
  </>;
}

export default Control;
