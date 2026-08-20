import { Effect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { ItemData } from "../sections/LightGroupTree";

export const instanceLeaf = (item: TreeItemProps<ItemData>, Effect: Effect) => {
  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return;

  // Enable item
  item.disabled = false;

  if (item.children) {
    // Iterate children recursively
    item.children.forEach((child) => {
      instanceLeaf(child, Effect);
      console.log("CHILDREN", child.name);
    });

    return;
  }
  console.log("CREATE EFFECT", Effect.name, item);

  // Calculate indexes from item
  const { id } = item;

  if (id && item.data?.segment) {
    // Segment? create (new) instance
    // TODO: check segment settings (dimensions, type,...)
    const { channelsPerLed, ledCount } = item.data.segment;
    item.data.effectInstance = new Effect(ledCount, 1, channelsPerLed, id)
    item.data.nextTick = Effect.refreshRate * 1000;
  }
}
