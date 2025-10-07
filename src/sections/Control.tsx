import { Component } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";

export const Control: Component = () => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  return <>
    <h1>Control section - [EffectName]</h1>
    <div>
      <SliderGroup/>
      <SliderGroup/>            
    </div>
    List effect channel preset for current (group) effect
  </>;
}

export default Control;
