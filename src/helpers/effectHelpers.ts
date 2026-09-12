import { Effect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { ItemData } from "../sections/LightGroupTree";

export const instanceLeaf = (item: TreeItemProps<ItemData>, Effect: Effect, channelValues?: number[]) => {
  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return;

  // Enable item
  item.disabled = false;

  if (item.children) {
    // Iterate children recursively
    item.children.forEach((child) => {
      instanceLeaf(child, Effect, channelValues);
    });

    return;
  }

  // Calculate indexes from item
  const { id } = item;

  if (id && item.data?.segment) {
    // Segment? create (new) instance
    // TODO: check segment settings (dimensions, type,...)
    const { channelsPerLed, width, height } = item.data.segment;
    item.data.effectInstance?.destroy();
    item.data.effectInstance = new Effect(width, height, channelsPerLed, id);
    // Override the channel values
    if (channelValues) {
      item.data.effectInstance.channelValues = channelValues.slice();
    }
    // TODO: messy code
    item.data.channelValues = item.data.effectInstance.channelValues.slice();
  }
}
