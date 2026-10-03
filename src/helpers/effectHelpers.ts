import { Effect } from "../../public/Effect";
import type { SegmentTreeItem } from "../types/ItemData";

export const instanceLeaf = (item: SegmentTreeItem, Effect: Effect, channelValues?: number[]) => {
  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return;

  const values = channelValues ?? item.data.channelValues ?? Effect.channels.map(channel => channel.default);
  // Enable item
  item.disabled = false;

  switch (item.type) {
    case "group":
      // Iterate children recursively
      item.children.forEach((child) => {
        instanceLeaf(child, Effect, values);
      });
      break;

    case "segment":
      // Calculate indexes from item
      const { id } = item;
      console.assert(!!id, "Tree item missing id", item);

      // Segment? create (new) instance
      // TODO: check segment settings (dimensions, type,...)
      const { channelsPerLed, width, height } = item.data.segment;
      item.data.effectInstance?.destroy();
      item.data.effectInstance = new Effect(width, height, channelsPerLed, id);
      break;
  }

  // Override the channel values
  // TODO: if item data channelValues are all set initially,
  //       we don't need the effect class channel default
  //       see App.tsx#55
  item.data.channelValues = values.slice();
}
