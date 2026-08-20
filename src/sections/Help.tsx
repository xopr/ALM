import { Component } from "solid-js";

export const Help: Component = () => {
  return <div id="content" class="contentContainer vertical">
    <h1>Help</h1>
    <ul>
      <li>Top tabs: live control, effect information and selection of lights
        <ul>
          <li>Control: live control of the selected light (or parent group)</li>
          <li>Effects: list of available effects with a description, available control (MIDI) channels<br/>
            frame speed, and supported Light dimensions.<br/>
            Drag an effect on the light group tree to apply it for all the descending segments.
          </li>
          <li>Lights: set up a physical light as Art-Net endpoint(s) a.k.a. segment(s).<br/>
            A segment defines a portion of the light (for example: a parasol spoke)<br/>
            or multiple segments can be used to combine multiple (512 channel) DMX universes (for example: displays or long strings).
          </li>
        </ul>
      </li>
      <li>Left tree: grouped setup of your light segments to apply effects to</li>
    </ul>
    <h1>Getting started</h1>
    Note that some features are not yet implemented.
    <ul>
      <s><li>Add lights to the list in the Light section on the right hand side.</li>
      <li>Configure segments per light (like spokes on a parasol or multiple universes on a display).</li>
      <li>Drag the Light (or segments) into the tree list on the left hand side to make it a child of it.</li></s>  
      <li>Drag effects to the groups or individual lights in the Effect section on the right hand side.</li>
      <li>Control the effect by clicking on a tree item and selecting Control.</li>
    </ul>
  </div>;
}

export default Help;
