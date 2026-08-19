import { Component, createSignal, Show } from "solid-js";
import { createMutable } from "solid-js/store";
import TreeList from "../components/treelist/TreeList";
import { treeClickHelper } from "../components/treelist/treeListHelpers";
import { TreeItemProps } from "../components/treelist/TreeItem";
import Light, { LightProps } from "../components/light/Light";
import { SegmentProps } from "../components/light/Segment";

import light_add_svg from "/src/assets/light_add.svg";
import light_remove_svg from "/src/assets/light_remove.svg";
import segment_add_svg from "/src/assets/segment_add.svg";
import segment_remove_svg from "/src/assets/segment_remove.svg";
import edit_svg from "/src/assets/edit.svg";

import light_svg from "/src/assets/light.svg";

// List of lights with their segments to direct Art-net data
const lights = createMutable<TreeItemProps<SegmentProps[]>>({
  name: "$ROOT",
  type: "$ROOT",
  children: [
    {
      name: "Torch",
      type: "light",
      icon: light_svg,
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
      icon: light_svg,
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
  const onClick = (selected?: TreeItemProps<SegmentProps[]>) => {
    setLight(selected);
  };

  const addLight = (type = "torch") => {
    // light()
    lights?.children?.push({
      name: `New ${type}`,
      type: "light",
      icon: light_svg,
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
    });
  };

  const removeLight = (light: TreeItemProps<SegmentProps[]>) => {
    lights?.children?.some((child, idx) => {
      if (child === light) {
        lights?.children?.splice(idx, 1);
        setLight();
        return true;
      }
    })
  };

  const addSegment = (light: TreeItemProps<SegmentProps[]>) => {
    light.data?.push(        {
      address: "127.0.0.1",
      port: 7000,
      universe: 1,
      channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
      channelsPerLed: 3, // type: "RGB"
      ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
      ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
    });
  };

  const removeSegment = (light?: TreeItemProps<SegmentProps[]>) => {
    light?.data?.splice(-1, 1);
  };

  const renameItem = (light?: TreeItemProps<SegmentProps[]>) => {
    if (!light) return;
    const name = prompt("New name", light.name);
    if (name) light.name = name;
  };

  return <>
        <div class="contentContainer vertical">
          <h1>Lights section [{light()?.name}]</h1>
          <div class="contentContainer vertical">
            Also list the effects that are currently tied to it?<br/>
            <Show when={light()}>
              <Light {...light() as LightProps} />
            </Show>
          </div>
        </div>
        <div class="inbetweenContainer vertical">
          <TreeList
            hideRoot
            class="contentContainer list vertical"
            item={lights}
            onClick={treeClickHelper(lights, onClick)}
          />
          <div>
            <button onClick={() => addLight()}><img src={light_add_svg}/></button>
            <button onClick={() => removeLight(light()!)} disabled={!light()}><img src={light_remove_svg}/></button>
            <button onClick={() => addSegment(light()!)} disabled={!light()}><img src={segment_add_svg}/></button>
            <button onClick={() => removeSegment(light()!)} disabled={!(light()?.data?.length > 1) }><img src={segment_remove_svg}/></button>
          <button onclick={() => renameItem(light())} disabled={!light()}><img src={edit_svg}/></button>
          </div>
        </div>
      </>;
}

export default Lights;
