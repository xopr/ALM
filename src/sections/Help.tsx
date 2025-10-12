import { Component } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";

export const Help: Component = (props) => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  return <>
    <h1>Help</h1>
    <ul>
      <li>Left tree: grouped setup of your light segments to apply effects to</li>
      <li>Top tabs: selection of lights, live control and effect information
        <ul>
          <li>Lights: set up a physical light as Art-Net endpoint(s) a.k.a. segment(s).<br/>
            A segment defines a portion of the light (for example: a parasol spoke)<br/>
            or multiple segments can be used to combine multiple (512 channel) DMX universes (for example: displays or long strings).
          </li>
          <li>Control: live control of the selected light (or parent group)</li>
          <li>Effects: list of available effects with a description, available control (MIDI) channels<br/>
            frame speed, and supported Light dimensions.<br/>
            Drag an effect on the light group tree to apply it for all the descending segments.
          </li>
        </ul>
      </li>
    </ul>
  </>;
}

export default Help;
