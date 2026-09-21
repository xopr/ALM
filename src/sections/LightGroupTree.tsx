import { Component, onMount } from "solid-js";
import TreeList from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { arrayFromTreeItem, assignId, getParent, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import { type DragDropData } from "../components/DragNode";
import { MessageData, Effect, type IEffect } from "../../public/Effect";
import { instanceLeaf } from "../helpers/effectHelpers";
import effect_svg from "/src/assets/effect.svg";
import { Artnet } from "../helpers/ArtNet";
import JSON5 from "json5";
import { invoke } from "@tauri-apps/api/core";
import type { EffectControlData, SegmentTreeGroup, SegmentTreeItem } from "../types/ItemData";

type LightGroupTreeProps = {
  onChannelValues?: (values: number[]) => void;  
  onSelect?: (item?: SegmentTreeItem) => void;
  class?: string;
};

export const getAncestorEffect = (item: SegmentTreeItem): { effect: Effect | undefined, channelValues: number[] } => {
  const indexes = arrayFromTreeItem(item)
  let effect: Effect | undefined;

  while (!effect && indexes.length) {
    const item = treeItemFromArray(lightGroups, indexes);
    const data = item?.data as EffectControlData | undefined;
    effect = data?.effect;

    if (effect) {
      return { effect, channelValues: data?.channelValues?.slice() ?? []}
    }

    indexes.pop();
  }

  return { effect, channelValues: [] };
};

export const getDescendingInstances = (effect: Effect, item: SegmentTreeItem): IEffect[] => {
  switch (item.type) {
    case "group":
      // We're not leaf level; collect our descendants
      if (item.children.length) {
        return Array.prototype.concat.call(item.children.map(getDescendingInstances.bind(this, effect))).flat();
      }
      break;

    case "segment":
      // Do we have an instance that matches our effect?
      if (item.data.effectInstance && item.data.effectInstance instanceof effect)
        return [item.data.effectInstance];
      break;
  }
  return [];
}

export const removeEffect = (item: SegmentTreeItem, effect?: string) => {
  const eff = effect ?? item.data?.effect?.name;
  if (!eff) return;
  // Don't delete different effect (instances)
  if (item.data?.effect?.name && item.data.effect.name !== eff) return;

  delete item.data?.effect;
  if (!item.data.originalEffect) {
    delete item.icon;
    item.disabled = true;
  }

  switch (item.type) {
    case "segment":
      item.data?.effectInstance?.destroy();
      delete item.data?.effectInstance;
      break;
    case "group":
      // TODO: optionally NOT recursive!
      item.children.forEach(child => {
        removeEffect(child, eff);
      });
      break;
  }
}

export const removeItem = (item: SegmentTreeItem) => {
  const indexes = arrayFromTreeItem(item)
  const parent = getParent(lightGroups, indexes);

  // Skip root node as well
  if (!parent || indexes.length <= 1 || parent?.type !== "group") return;

  parent.children.splice(indexes.pop()!, 1);
  // TODO: remove instance
  // removedItem?.[0].data.instance
  // TODO: remove/destroy children
  // Recalculate indices
  assignId(parent, parent.id ?? "B0RK");
}
const artnet = new Artnet();
// Groups of light(-segment)s to attach an effect to.

export const lightGroups = createMutable<SegmentTreeGroup>({ id: "0", name: "$ROOT", type: "group", children: [], data: {} });

const over = (_item: SegmentTreeItem, _data: DragDropData<Effect>, _side: string) => {
};

const drop = (item: SegmentTreeItem, data: DragDropData<Effect>) => {
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

      instanceLeaf(item, data.sourceData, data.sourceData.channels.map(c => c.default));

      // Store effect we just dropped
      item.data!.effect = data.sourceData;
      break;

    case "dmxLight":
      console.debug("TODO: special case: light and all its segments as children");
      break;

    case "segment":
      console.debug("TODO: do segment droppings");
      break;

    default:
      console.warn("unknown type:", data.type, data);
  }

};

const readGroups = async (filename: string): Promise<SegmentTreeGroup | undefined> => {
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
        return JSON5.parse<SegmentTreeGroup>(data);

      } catch (e) {
        console.warn("Failed to open and parse tree group JSON");
        // Pass
      }      
    }
  return undefined;
}

export const LightGroupTree: Component<LightGroupTreeProps> = (props) => {
  onMount(async () => {
    const LightGroupsJson = await readGroups("lightgroups.json5");
    lightGroups.children = LightGroupsJson?.children ?? [];

    // Assign id to each element
    // Note: also sets data object
    assignId(lightGroups, "0");

    let timer: Record<string,number> = {};
    window.addEventListener("message", ({ data: [id, timestamp, type, data] }: MessageData) => {
      if (timestamp) return; // Only from Effect

      // Get corresponding segment
      const treeItem = treeItemFromArray<SegmentTreeItem>(lightGroups, id.split("_").map(s => parseInt(s)));
      if (treeItem?.type !== "segment" || !treeItem.data.effectInstance) return;
      console.assert(!!treeItem.data.segment, "Missing segment data");

      switch (type)
      {
        case "frame":
          const { address, port, universe, channelStart, channelsPerLed, width, height, ledOffset } = treeItem.data.segment;
          // TODO: we want to provide parent data, but not own effect data
          // if (treeItem.data.originalEffect) return;

          void artnet.send(data, address, port, universe, channelStart, channelsPerLed, width * height, ledOffset)

          if (treeItem.disabled) return;
          clearTimeout(timer[id]);
          if (treeItem.data.effectInstance?.renderDelay) {
            timer[id] = window.setTimeout(() => {
              // Hand over the leds buffer
              // Error: DataCloneError: The object can not be cloned.
              if (data.byteLength)
                window.postMessage([id, performance.now(), type, data], { transfer: [data] } );
              else
                console.warn("No data to transmit.");
            }, treeItem.data.effectInstance.renderDelay * 1000);
          }
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

  const onSelect = (selectedItem?: SegmentTreeItem) => {
    props.onSelect?.(selectedItem);
  };

  return <TreeList
    horizontalScroll
    hideRoot
    class={props.class}
    item={lightGroups}
    onClick={treeClickHelper(lightGroups, onSelect)}
    accept={["effect", "dmxLight"]}
    onDragOver={treeDragHelper(lightGroups, over)}
    onDrop={treeDragHelper(lightGroups, drop)}
  />;
}