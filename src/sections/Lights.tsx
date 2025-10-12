import { Component, createSignal, Show } from "solid-js";
import sectionStyles from "../sections/Section.module.css";
import { createMutable } from "solid-js/store";
import TreeList, { TreeListProps } from "../components/treelist/TreeList";
import { treeClickHelper } from "../components/treelist/treeListHelpers";
import { TreeItemProps } from "../components/treelist/TreeItem";
import Light, { LightProps } from "../components/Light/Light";
import { SegmentProps } from "../components/Light/Segment";

// List of lights with their segments to direct Art-net data
const lights = createMutable<TreeListProps<SegmentProps[]>>({
  children: [
    {
      name: "Torch",
      type: "light",
      data: [
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
      type: "light",
      data: [
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
});

export const Lights: Component = () => {
  const [light, setLight] = createSignal<TreeItemProps<SegmentProps[]>>();
  const onClick = (selected: TreeItemProps<SegmentProps[]>) => {
    setLight(selected);
    // selected.data[0].address
    // console.log(selected.data)

  };
  
  return <>
        <h1>Lights section [{light()?.name}]</h1>
        <div class={sectionStyles.container}>
          <div class={`${sectionStyles.container} ${sectionStyles.vertical}`}>
            Also list the effects that are currently tied to it?<br/>
            <Show when={light()}>
              <Light {...light() as LightProps} />
            </Show>
          </div>
          <div class={`${sectionStyles.container} ${sectionStyles.vertical}`} style={{flex: "0 0 20vw"}}>
            <TreeList
              children={lights.children}
              onClick={treeClickHelper(lights, onClick)}
            />
          </div>
        </div>

      </>;
}

export default Lights;
