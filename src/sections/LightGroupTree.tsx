import { Component, onMount } from "solid-js";
import TreeList from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { arrayFromTreeItem, assignId, getParent, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import { type DragDropData } from "../components/DragNode";
import { MessageData, Effect, type IEffect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { instanceLeaf } from "../helpers/effectHelpers";

import effect_svg from "/src/assets/effect.svg";
import { SegmentProps } from "../components/light/Segment";
import { Artnet } from "../helpers/ArtNet";

import JSON5 from "json5";
import { invoke } from "@tauri-apps/api/core";

type LightGroupTreeProps = {
  /** @deprecated move logic inside onSelect */
  onEffect?: (effect?: Effect) => void;
  onChannelValues?: (values: number[]) => void;  
  onSelect?: (item?: TreeItemProps<ItemData>) => void;
  /** @deprecated move logic inside onSelect */
  onInstances?: (instances?: IEffect[]) => void;  
  class?: string;
};

export type ItemData = {
  effect?: Effect; // TODO: string for better serializing
  originalEffect?: Effect;
  effectInstance?: IEffect;
  effectDisabled?: boolean;
  channelValues: number[]; // TODO
  nextTick?: number;
  segment?: SegmentProps;
};

export const getDescendingEffect = (item: TreeItemProps): { effect: Effect | undefined, channelValues: number[] } => {
  const indexes = arrayFromTreeItem(lightGroups, item)
  indexes.pop(); // Needed to get parent
  let effect: Effect | undefined;

  // TODO: channelValues not on instance, but item.data /!\
  while (!effect && indexes.length) {
    const data: ItemData | undefined = treeItemFromArray(lightGroups, indexes)?.data;
    effect = data?.effect;

    if (effect) {
      return { effect, channelValues: data?.channelValues.slice() ?? []}
    }

    indexes.pop();

  }

  console.log("Effect not found; empty channel values", effect);
  return { effect, channelValues: [] };
};

export const removeEffect = (item: TreeItemProps<ItemData>, effect?: string) => {
  const eff = effect ?? item.data?.effect?.name;
  if (!eff) return;
  // Don't delete different effect (instances)
  if (item.data?.effect?.name && item.data.effect.name !== eff) return;
  item.data?.effectInstance?.destroy();
  delete item.data?.effectInstance;
  delete item.data?.effect;
  delete item.icon;
  item.disabled = true;

  // TODO: optionally NOT recursive!
  item.children?.forEach(child => {
    removeEffect(child, eff);
  });
}

export const removeItem = (item: TreeItemProps<ItemData>) => {
  const indexes = arrayFromTreeItem(lightGroups, item)
  const parent = getParent(lightGroups, indexes);

  // Skip root node as well
  if (!parent || indexes.length <= 1) return;

  const removedItem = parent.children?.splice(indexes.pop()!, 1);
  // TODO: remove instance
  // removedItem?.[0].data.instance
  // TODO: remove/destroy children
  // Recalculate indices
  assignId(parent, parent.id ?? "B0RK");
}
const artnet = new Artnet();
// Groups of light(-segment)s to attach an effect to.

export const lightGroups = createMutable<TreeItemProps>({ name: "$ROOT" });

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
      item.data!.effect = undefined;
      // Set effect icon      
      item.icon = effect_svg;

      instanceLeaf(item, data.sourceData);

      // Store effect we just dropped
      item.data!.effect = data.sourceData;
      break;

    case "light":
      console.debug("TODO: special case: light and all its segments as children");
      break;

    case "segment":
      console.debug("TODO: do segment droppings");
      break;

    default:
      console.warn("unknown type:", data.type, data);
  }

};

const readGroups = async (filename: string): Promise<TreeItemProps | undefined> => {
  const dirs = [
        "../../../public/",
        "../public/",
        "./",
    ];

    for await (const dir of dirs) {
      try {
        const fileName = `${dir}${filename}`;
        const data = await invoke<string>("read_file", { fileName });
        if (!data) continue;
        return JSON5.parse<TreeItemProps>(data);

      } catch (e) {
        // Pass
      }      
    }
  return undefined;
}

export const LightGroupTree: Component<LightGroupTreeProps> = (props) => {
  // const [selectedEffect, setSelectedEffect] = createSignal<Effect>();
  // const [selectedSegment, setSelectedSegment] = createSignal<SegmentProps>();

  onMount(async () => {
    const LightGroupsJson = await readGroups("lightgroups.json5");
    lightGroups.children = LightGroupsJson?.children;

    // Assign id to each element
    assignId(lightGroups, "0");

    let timer: Record<string,number> = {};
    window.addEventListener("message", ({ data: [id, timestamp, type, data] }: MessageData) => {
      if (timestamp) return; // Only from Effect

      // Get corresponding segment
      const treeItem = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, id.split("_").map(s => parseInt(s)));
      if (!treeItem?.data?.effectInstance) return;
      if (!treeItem?.data?.segment) return;

      switch (type)
      {
        case "frame":
          const { address, port, universe, channelStart, channelsPerLed, width, height, ledOffset } = treeItem.data.segment;
          // TODO: we want to provide parent data, but not own effect data
          // if (treeItem.data.effectDisabled) return;

          void artnet.send(data, address, port, universe, channelStart, channelsPerLed, width * height, ledOffset)

          if (treeItem.disabled) return;

          clearTimeout(timer[id]);
          timer[id] = window.setTimeout(() => {
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
          // TODO: either move out of this class or include selected item channel values.
          //       For now, handle in App.tsx
          props.onChannelValues?.(data);
          break;
      }

    });
  });

  const onSelect = (selectedItem?: TreeItemProps<ItemData>) => {
    props.onSelect?.(selectedItem);
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