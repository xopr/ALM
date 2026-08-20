import { Component, onMount } from "solid-js";
import TreeList from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { arrayFromTreeItem, getParent, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import { type DragDropData } from "../components/DragNode";
import { MessageData, Effect, type IEffect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { instanceLeaf } from "../helpers/effectHelpers";

import effect_svg from "/src/assets/effect.svg";
import { SegmentProps } from "../components/light/Segment";
import { Artnet } from "../helpers/ArtNet";

type LightGroupTreeProps = {
  onEffect?: (effect?: Effect) => void;
  onChannelValues?: (values: number[]) => void;  
  onSelect?: (item?: TreeItemProps<ItemData>) => void;
  onInstances?: (instances?: IEffect[]) => void;  
  class?: string;
};

export type ItemData = {
  effect?: Effect; // TODO: string for better serializing
  effectInstance?: IEffect;
  effectDisabled?: boolean;
  nextTick?: number;
  segment?: SegmentProps;
};

export const removeEffect = (item: TreeItemProps<ItemData>, effect?: string) => {
  const eff = effect ?? item.data?.effect?.name;
  if (!eff) return;
  // Don't delete different effect (instances)
  if (item.data?.effect?.name && item.data.effect.name !== eff) return;

  delete item.data?.effectInstance;
  delete item.data?.effect;
  delete item.icon;
  item.disabled = true;

  item.children?.forEach(child => {
    removeEffect(child, eff);
  });
}

export const removeItem = (item: TreeItemProps<ItemData>) => {
  const indexes = arrayFromTreeItem(lightGroups, item)
  const parent = getParent(lightGroups, indexes);

  // Skip root node as well
  if (!parent || indexes.length <= 1) return;

  parent.children?.splice(indexes.pop()!, 1);
}
const artnet = new Artnet();
// Groups of light(-segment)s to attach an effect to.
export const lightGroups = createMutable<TreeItemProps>({
  name: "$ROOT",
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
                  address: "192.168.7.230",
                  port: 6454,
                  universe: 0,
                  channelStart: 9,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
            {
              name: "String",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "192.168.7.234",
                  port: 6454,
                  universe: 0,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 99,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
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
                  address: "192.168.7.231",
                  port: 6454,
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
                  address: "192.168.7.233",
                  port: 6454,
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
                      address: "192.168.7.235",
                      port: 6454,
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
                      address: "192.168.7.235",
                      port: 6454,
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
                      address: "192.168.7.235",
                      port: 6454,
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
                  address: "192.168.7.233",
                  port: 6454,
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
          name: "PC",
          disabled: true,
          type: "group",
          children: [
            {
              name: "simstrip1",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7000,
                  universe: 0,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
            {
              name: "simstrip2",
              type: "segment",
              disabled: true,
              data: {
                segment: {
                  address: "127.0.0.1",
                  port: 7001,
                  universe: 0,
                  channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
                  channelsPerLed: 3, // type: "RGB"
                  ledCount: 147,       // 7 * 21, warn if: overlap w/ other segment, out of bounds
                  ledOffset: 3,      // amount of LEDs to skip within effect (bezel/padding)
                },
              },
            },
          ],
        },

        // {
        //   name: "Display",
        //   disabled: true,
        //   type: "group",
        //   children: [
        //     {
        //       name: "Display (1)(2)(3)",
        //       type: "segment",
        //       disabled: true,
        //     },
        //   ],
        // },
      ],
    },
  ]
});

const over = (item: TreeItemProps<ItemData>, data: DragDropData<Effect>, side: string) => {
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

      instanceLeaf(item, data.sourceData);

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
    let timer: number;
    window.addEventListener("message", ({ data: [id, timestamp, type, data] }: MessageData) => {
      if (timestamp) return; // Only from Effect

      // Get corresponding segment
      const treeItem = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, id.split("_").map(s => parseInt(s)));
      if (!treeItem?.data?.effectInstance) return;
      if (!treeItem?.data?.segment) return;

      switch (type)
      {
        case "frame":
          const { address, port, universe, channelStart, channelsPerLed, ledCount, ledOffset } = treeItem.data.segment;
          void artnet.send(data, address, port, universe, channelStart, channelsPerLed, ledCount, ledOffset)

          console.assert(treeItem.data.nextTick);
          if (treeItem.data.effectDisabled) return;

          clearTimeout(timer);
          timer = window.setTimeout(() => {
            // Hand over the leds buffer
            // Error: DataCloneError: The object can not be cloned.
            if (data.byteLength)
              window.postMessage([id, performance.now(), type, data], { transfer: [data] } );
            else
              console.warn("No data to transmit.");
          }, treeItem.data.nextTick);
          break;

        case "channels":
          // Handle initial channel values
          props.onChannelValues?.(data);
          break;
      }

    });
  });

  const getInstances = (item?: TreeItemProps<ItemData>): IEffect[] => {
    // We're not leaf level; collect our descendants
    if (item?.children?.length) {
      return Array.prototype.concat.call(item.children.map(getInstances)).flat()
    }
    console.log("I", item?.data?.effectInstance);
    // Do we have an instance?
    if (item?.data?.effectInstance)
      return [item.data.effectInstance];
    else
      return [];
  }
  
  const onSelect = (selectedItem?: TreeItemProps<ItemData>) => {
    let effect: Effect | undefined;
    props.onSelect?.(selectedItem);
    if (selectedItem) {
      const indexes = arrayFromTreeItem(lightGroups, selectedItem);
      
      effect = selectedItem.data?.effect;
      // Get Effect class (recursively by parent)
      while (!effect && indexes.length) {
        indexes.pop();
        effect = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, indexes)?.data?.effect;
      }

      console.log("SELECT", effect, getInstances(selectedItem))

      if (effect)
      {
        const selectedInstances = getInstances(selectedItem);
        props.onInstances?.(selectedInstances);
      } else {
        props.onInstances?.([]);
      }

    } else {
      props.onInstances?.([]);
    }

    // DON'T instantiate
    props.onEffect?.(() => effect);
  };

  return <TreeList
    horizontalScroll
    hideRoot
    class={props.class}
    item={lightGroups}
    onClick={treeClickHelper(lightGroups, onSelect)}
    accept={["effect", "light"]}
    onDragOver={treeDragHelper(lightGroups, over)}
    onDrop={treeDragHelper(lightGroups, drop)}
  />;
}