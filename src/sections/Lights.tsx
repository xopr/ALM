import { Component, For } from "solid-js";
import sectionStyles from "../sections/Section.module.css";

// List of lights with their segments to direct Art-net data
const lights = [
  {
    name: "LightGroup",
    lights: [
      {
        name: "Torch",
        segments: [
          {
            address: "127.0.0.1",
            port: 7000,
            universe: 1,
            channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
            channelsPerLed: 3, // type: "RGB"
            ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
            ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
          }
        ]
      },
      {
        name: "Parasol",
        segments: [
          {
            address: "127.0.0.1",
            port: 7000,
            universe: 1,
            channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
            channelsPerLed: 3, // type: "RGB"
            ledCount: 80,      // 2 parallel spokes of 80 LEDs
            ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
          },
          {
            address: "127.0.0.1",
            port: 7000,
            universe: 1,
            channelStart: 240, // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
            channelsPerLed: 3, // type: "RGB"
            ledCount: 80,      // 2 parallel spokes of 80 LEDs
            ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
          },
          {
            address: "127.0.0.1",
            port: 7000,
            universe: 2,
            channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
            channelsPerLed: 3, // type: "RGB"
            ledCount: 80,      // 2 parallel spokes of 80 LEDs
            ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
          }
        ]
      }
    ]
  }
];

export const Lights: Component = () => {
  return <>
        <h1>Lights section</h1>
        <div class={sectionStyles.container}>
          <div class={sectionStyles.container}>
            List the lights here to review their sections and properties (LED type, IP port universe).<br/>
            List the sections so we can drag them into the groups.<br/>
            Also list the effects that are currently tied to it?<br/>
        </div>
          <div class={`${sectionStyles.container} ${sectionStyles.vertical}`} style={{flex: "0 0 20vw"}}>
            <For each={[]}>{(effect) =>
              <div>{effect}</div>
            }</For>
          </div>
        </div>

      </>;
}

export default Lights;
