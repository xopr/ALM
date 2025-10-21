import { IEffect, Effect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { TreeListProps } from "../components/treelist/TreeList";
import { arrayFromTreeItem } from "../components/treelist/treeListHelpers";
import { ItemData } from "../sections/LightGroupTree";

export const instanceLeaf = (tree: TreeListProps, item: TreeItemProps<ItemData>, Effect: Effect): Record<string, [effectInstance: IEffect, frameTime: number]> => {
  // TODO: collect instances, merge arrays so we can isolate this method
  const newInstances: Record<string, [effectInstance: IEffect, frameTime: number]> = {};

  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return newInstances;

  // Enable item
  item.disabled = false;

  if (item.children) {
    // Iterate children recursively
    item.children.forEach((child) => {
      const childInstances = instanceLeaf(tree, child, Effect);

      // Merge objects (Object.assign?)
      for (const idx in childInstances ) {
        newInstances[idx] = childInstances[idx];
      }
    });

    return newInstances;
  }

  // Calculate indexes from item
  const id = arrayFromTreeItem(tree, item).join("_");

  // if (id && item.data?.segment) {
  if (id && item.data?.segment) {
    // Segment? create (new) instance
    // TODO: check segment settings (dimensions, type,...)
    const { channelsPerLed, ledCount } = item.data.segment;
    newInstances[id] = [new Effect(ledCount, 1, channelsPerLed, id), Effect.refreshRate * 1000];
  }

  return newInstances;
}
