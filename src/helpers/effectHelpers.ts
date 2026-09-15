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
      // Override the channel values from determined values
      item.data.channelValues = values.slice();

      // Iterate children recursively
      item.children.forEach((child) => {
        instanceLeaf(child, Effect, values);
      });
      return;

    case "segment":
      // Calculate indexes from item
      const { id } = item;
      console.assert(!!id, "Tree item missing id", item);

      // Segment? create (new) instance
      // TODO: check segment settings (dimensions, type,...)
      const { channelsPerLed, width, height } = item.data.segment;
      item.data.effectInstance?.destroy();
      item.data.effectInstance = new Effect(width, height, channelsPerLed, id);

      // Override the channel values
      item.data.channelValues = values.slice();
      break;
  }
}
