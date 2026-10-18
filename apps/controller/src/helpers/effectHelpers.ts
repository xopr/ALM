import { Effect } from "../../public/Effect";
import type { SegmentTreeItem } from "../types/ItemData";
import { Artnet } from "./ArtNet";

export const cleanup = async (item: SegmentTreeItem): Promise<void> => {
  // Only applies for groups and segments that have no effect applied
  if (item.data.effect) return;

  switch (item.type) {
    case "group":
      // Iterate children recursively
      for await (const child of item.children) {
        await cleanup(child);
      }
      break;

    case "segment":
      const { id } = item;
      console.assert(!!id, "Tree item missing id", item);

      const { address, port, universe, channelStart, channelsPerLed, width, height, ledOffset } = item.data.segment;

      // Send empty packet
      const ledCount = width * height;
      const data = new ArrayBuffer(channelsPerLed * ledCount);
      const artnet = new Artnet();
      await artnet.send(data, address, port, universe, channelStart, channelsPerLed, ledCount, ledOffset)

      break;
  }
}
export const instanceLeaf = (item: SegmentTreeItem, Effect: Effect, channelValues?: number[], channelMute?: boolean[]) => {
  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return;

  const values = channelValues ?? item.data.channelValues ?? Effect.channels.map(channel => channel.default);
  const mute = channelMute ?? item.data.channelMute ?? new Array(Effect.channels.length).fill(false);

  // Enable item
  item.disabled = false;

  switch (item.type) {
    case "group":
      // Iterate children recursively
      item.children.forEach((child) => {
        instanceLeaf(child, Effect, values, mute);
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
  item.data.channelMute = mute.slice();
}
