import { Component, createSignal, Show } from "solid-js";
import { createMutable } from "solid-js/store";
import TreeList from "../components/treelist/TreeList";
import { treeClickHelper } from "../components/treelist/treeListHelpers";
import Light from "../components/light/Light";

import LightAddIcon from "/src/assets/light_add.svg";
import LightRemoveIcon from "/src/assets/light_remove.svg";
import SegmentAddIcon from "/src/assets/segment_add.svg";
import SegmentRemoveIcon from "/src/assets/segment_remove.svg";
import EditIcon from "/src/assets/edit.svg";
import LightIcon from "/src/assets/light.svg";
import { DmxLightItem, LightTreeGroup, LightTreeItem } from "../types/ItemData";


// List of lights with their segments to direct Art-net data
const lights = createMutable<LightTreeGroup>({
  name: "$ROOT",
  type: "group",
  children: [
    {
      name: "Torch",
      type: "dmxLight",
      icon: LightIcon,
      data: [
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          width: 7,
          height: 21,
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        }
      ]
    },
    {
      name: "Parasol",
      type: "dmxLight",
      icon: LightIcon,
      data: [
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          width: 1,
          height: 80,
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        },
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 240, // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          width: 1,
          height: 80,
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        },
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 2,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          width: 1,
          height: 80,
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        }
      ]
    }
  ]
});

export const Lights: Component = () => {
  const [light, setLight] = createSignal<LightTreeItem>();
  const onClick = (selected?: LightTreeItem) => {
    setLight(selected);
  };

  const addLight = (type = "torch") => {
    // light()
    lights?.children?.push({
      name: `New ${type}`,
      type: "dmxLight",
      icon: LightIcon,
      data: [
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          width: 7,
          height: 21,
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        }
      ]
    });
  };

  const removeLight = (light: LightTreeItem) => {
    lights?.children?.some((child, idx) => {
      if (child === light) {
        lights?.children?.splice(idx, 1);
        setLight();
        return true;
      }
    })
  };

  const addSegment = (light: LightTreeItem) => {
    if (light.type === "group") return;

    light.data.push(        {
      address: "127.0.0.1",
      port: 7000,
      universe: 1,
      channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
      channelsPerLed: 3, // type: "RGB"
      width: 7,
      height: 21,
      ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
    });
  };

  const removeSegment = (light?: LightTreeItem) => {
    if (!light || light.type === "group") return;
    light.data.splice(-1, 1);
  };

  const renameItem = (light?: LightTreeItem) => {
    if (!light) return;
    const name = prompt("New name", light.name);
    if (name) light.name = name;
  };

  return <>
        <div class="contentContainer vertical">
          <h1>Lights section [{light()?.name}]</h1>
          <div class="contentContainer vertical">
            <Show when={light()?.type ==="dmxLight"}>
              <Light {...light() as DmxLightItem} />
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
            <button title="Add light" onClick={() => addLight()}>{LightAddIcon}</button>
            <button title="Delete light" onClick={() => removeLight(light()!)} disabled={!light()}>{LightRemoveIcon}</button>
            <button title="Add segment" onClick={() => addSegment(light()!)} disabled={!light()}>{SegmentAddIcon}</button>
            <button title="Remove last segment" onClick={() => removeSegment(light()!)} disabled={!(light()?.data?.length > 1) }>{SegmentRemoveIcon}</button>
          <button title="Rename light" onclick={() => renameItem(light())} disabled={!light()}>{EditIcon}</button>
          </div>
        </div>
      </>;
}

export default Lights;
