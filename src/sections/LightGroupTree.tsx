import { Component, onMount } from "solid-js";
import TreeList, { TreeListProps } from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { arrayFromTreeItem, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import { type DragDropData } from "../components/DragNode";
import { DataFrame, Effect, type IEffect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { instanceLeaf } from "../helpers/effectHelpers";

import effect_svg from "/src/assets/effect.svg";
import { SegmentProps } from "../components/light/Segment";
import { Artnet } from "../helpers/ArtNet";

type LightGroupTreeProps = {
  onEffect?: (effect?: Effect) => void;
  onSelect?: (item?: TreeItemProps<ItemData>) => void;
  onInstances?: (instances?: IEffect[]) => void;  
  class?: string;
};

export type ItemData = {
  effect?: Effect;
  segment?: SegmentProps;
};

const instances: Record<string, [effectInstance: IEffect, frameTime: number]> = {};

const artnet = new Artnet();
// Groups of light(-segment)s to attach an effect to.
const lightGroups = createMutable<TreeListProps>({
  children: [
    {
      name: "Boshovenpop",
      disabled: true,
      type: "group",
      children: [
        {
          name: "Camping",
          disabled: true,
          type: "group",
          children: [
            {
              name: "Sleeve1 - 1",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7000,
                  universe: 0,
                  channelStart: 9,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
          ],
        },
        {
          name: "Tent",
          disabled: true,
          type: "group",
          children: [
            {
              name: "Sleeve2 (1)",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7000,
                  universe: 1,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
            {
              name: "Flut (1)",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7000,
                  universe: 1,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 1,       // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 1,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
          ],
        },
        {
          name: "Terrace",
          disabled: true,
          type: "group",
          children: [
            {
              name: "Parasol",
              disabled: true,
              type: "group",
              children: [
                {
                  name: "Parasol (1)",
                  type: "segment",
                  disabled: true,
                  data: {
                    segment: {
                      address: "127.0.0.1",
                      port: 7000,
                      universe: 1,
                      channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                      channelsPerLed: 3, // type: "RGB"
                      ledCount: 80,      // 2 parallel spokes of 80 LEDs
                      ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                    },
                  },
                },
                {
                  name: "Parasol (2)",
                  type: "segment",
                  disabled: true,
                  data: {
                    segment: {
                      address: "127.0.0.1",
                      port: 7000,
                      universe: 1,
                      channelStart: 240, // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                      channelsPerLed: 3, // type: "RGB"
                      ledCount: 80,      // 2 parallel spokes of 80 LEDs
                      ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                    },
                  },
                },
                {
                  name: "Parasol (3)",
                  type: "segment",
                  disabled: true,
                  data: {
                    segment: {
                      address: "127.0.0.1",
                      port: 7000,
                      universe: 2,
                      channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                      channelsPerLed: 3, // type: "RGB"
                      ledCount: 80,      // 2 parallel spokes of 80 LEDs
                      ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                    },
                  },
                },
              ],
            },
            {
              name: "Sleeve3 (1)",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7000,
                  universe: 1,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
          ],
        },
        {
          name: "Display",
          disabled: true,
          type: "group",
          children: [
            {
              name: "Display (1)(2)(3)",
              type: "segment",
              disabled: true,
              // TODO: segment array?
            },
          ],
        },
      ],
    },
  ]
});

const over = (item: TreeItemProps<ItemData>, data: DragDropData<Effect>, side: string) => {
  // TODO: set drag over highlight side (for light)
  //side: center, top/bottom/left/right
  // item.outlined = "top"
};

const drop = (item: TreeItemProps<ItemData>, data: DragDropData<Effect>) => {

  // Item might not have data object yet
  if (!item.data) item.data = {};

  switch (data.type)
  {
    case "effect":
      if (!data.sourceData) return;
      // Iterate all leafs to update the running effects. Clear effect to allow instanceLeaf to do its thing.
      item.data.effect = undefined;
      // Set effect icon      
      item.icon = effect_svg;

      // Merge objects
      Object.assign(instances, instanceLeaf(lightGroups, item, data.sourceData));

      // Store effect we just dropped
      item.data.effect = data.sourceData;
      break;

    case "light":
      console.log("special case: light and all its segments as children");
      break;

    case "segment":
      console.log("do segment droppings");
      break;

    default:
      console.warn("unknown type:", data.type, data);
  }

};

export const LightGroupTree: Component<LightGroupTreeProps> = (props) => {
  // const [selectedEffect, setSelectedEffect] = createSignal<Effect>();
  // const [selectedSegment, setSelectedSegment] = createSignal<SegmentProps>();

  onMount(() => {
    // window.onmessage
    window.addEventListener("message", ({ data: [id, timestamp, data] }: DataFrame) => {
      if (timestamp) return; // Only from Effect
      if (!(id in instances)) return;
      // Get corresponding segment
      const treeItem = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, id.split("_").map(s => parseInt(s)));
      // console.log("incoming frame", id, timestamp, data, treeItem?.data?.segment);

      if (!treeItem?.data?.segment) return;

      const { address, port, universe, channelStart, channelsPerLed, ledCount, ledOffset } = treeItem.data.segment;
      artnet.send(data, address, port, universe, channelStart, channelsPerLed, ledCount, ledOffset)

      setTimeout(() => {
        // Hand over the leds buffer
        window.postMessage([id, performance.now(), data], { transfer: [data] } );
      }, instances[id][1]);

    });
  });
  
  const onSelect = (selectedItem?: TreeItemProps<ItemData>) => {  
    let effect: Effect | undefined;
    props.onSelect?.(selectedItem);
    if (selectedItem) {
      const indexes = arrayFromTreeItem(lightGroups, selectedItem);
      
      effect = selectedItem.data?.effect;
      // Get effect name (recursively by parent)
      while (!effect && indexes.length) {
        indexes.pop();
        effect = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, indexes)?.data?.effect;
      }

      // Calculate indexes from item
      const selectedId = arrayFromTreeItem(lightGroups, selectedItem).join("_");
      // Filter out other effects
      const selectedInstances = Object.keys(instances).filter((id) => {
        if (!id.startsWith(selectedId)) return false;
        if (instances[id][0] instanceof effect) return true;
        return false;
      }).map((id) => instances[id][0]);

      props.onInstances?.(selectedInstances);
    } else {
      props.onInstances?.([]);
    }
    // DON'T instantiate
    props.onEffect?.(() => effect);

    // TODO: do we want to select the light effect for light view?
  };

  return <TreeList
    horizontalScroll
    class={props.class}
    children={lightGroups.children}
    onClick={treeClickHelper(lightGroups, onSelect)}
    accept={["effect", "light"]}
    onDragOver={treeDragHelper(lightGroups, over)}
    onDrop={treeDragHelper(lightGroups, drop)}
  />;
}