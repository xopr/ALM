import { Component } from "solid-js";
import TreeList, { TreeListProps } from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { arrayFromTreeItem, treeClickHelper, treeDragHelper, treeItemFromArray } from "../components/treelist/treeListHelpers";
import { type DragDropData } from "../components/DragNode";
import { Effect, type IEffect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";

const instances: Record<string, IEffect> = {};

// Groups of light(-segment)s to attach an effect to.
const lightGroups = createMutable<TreeListProps>({
  children: [
    {
      name: "Boshovenpop",
      children: [
        {
          name: "Camping",
          children: [
            { name: "Sleeve1 - 1" },
          ],
        },
        {
          name: "Tent",
          children: [
            { name: "Sleeve2 (1)"},
            { name: "Flut (1)"},
          ],
        },
        {
          name: "Terrace",
          children: [
            {
              name: "Parasol",
              children: [
                { name: "Parasol (1)"},
                { name: "Parasol (2)"},
                { name: "Parasol (3)"},
              ],
            },
            { name: "Sleeve3 (1)"},
          ],
        },
        {
          name: "Display",
          children: [
            { name: "Display (1)(2)(3)" },
          ],
        },
      ],
    },
  ]
});

type ItemData = {
  effect?: Effect;
  segment?: unknown; // LightSegment
};

const drop = (item: TreeItemProps<ItemData>, data: DragDropData<Effect>) => {
  console.assert(data.type === "effect"); // Future: light
  if (!data.sourceData) return;

  console.log("DROP", item, data.sourceData);

  // Item might not have data object yet
  if (!item.data) item.data = {};

  // Iterate all leafs to update the running effects. Clear effect to allow instance to do its thing.
  item.data.effect = undefined;
  instanceLeaf(item, data.sourceData);
  // Store effect we just dropped
  item.data.effect = data.sourceData;
};

const instanceLeaf = (item: TreeItemProps<ItemData>, Effect: Effect) => {
  // TODO: collect instances, merge arrays so we can isolate this method
  // const newInstances = [];

  // (Different) effect applied to this subtree, stop propagation.
  if (item.data?.effect) return;

  // Calculate indexes from item
  const id = arrayFromTreeItem(lightGroups, item).join("_");

  if (item.children) {
    // Iterate children recursively
    item.children.forEach((child) => instanceLeaf(child, Effect));
  // } else if (id && item.data?.segment) {
  } else if (id) {
    // Segment? create (new) instance
    // TODO: maybe set a map of instances
    instances[id] = new Effect();
    // if (!item.data) item.data = {};
    // item.data.instance = new Effect();
    // TODO: check segment settings (dimensions, type,...)
  }
}

type LightGroupTreeProps = {
  onEffectName?: (effectName?: string) => void;
  // onSelectedItem => effect, segment
};

export const LightGroupTree: Component<LightGroupTreeProps> = (props) => {
  // const [selectedEffect, setSelectedEffect] = createSignal<Effect>();
  // const [selectedSegment, setSelectedSegment] = createSignal<LightSegment>();
  const onSelect = (selectedItem: TreeItemProps<ItemData>) => {

    const indexes = arrayFromTreeItem(lightGroups, selectedItem);
    let effect = selectedItem.data?.effect;

    // Get effect name (recursively by parent)
    while (!effect && indexes.length) {
      indexes.pop();
      effect = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, indexes)?.data?.effect;
    }
    props.onEffectName?.(effect?.name);

    // TODO: do we want to select the light effect for light view?
  };

  return <TreeList
    horizontalScroll
    children={lightGroups.children}
    onClick={treeClickHelper(lightGroups, onSelect)}
    accept={["effect", "light"]}
    onDragOver={treeDragHelper(lightGroups)}
    onDrop={treeDragHelper(lightGroups, drop)}
  />;
}