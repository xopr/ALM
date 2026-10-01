import { Component, onMount } from "solid-js";
import TreeList from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { assignId, drop, over, readGroups, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import type { MessageData } from "../../public/Effect";
import { Artnet } from "../helpers/ArtNet";
import type { SegmentTreeGroup, SegmentTreeItem } from "../types/ItemData";

type LightGroupTreeProps = {
  onChannelValues?: (values: number[]) => void;  
  onSelect?: (item?: SegmentTreeItem) => void;
  class?: string;
};

const artnet = new Artnet();

// Groups of light(-segment)s to attach an effect to.
export const lightGroups = createMutable<SegmentTreeGroup>({ id: "0", name: "$ROOT", type: "group", children: [], data: {} });

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