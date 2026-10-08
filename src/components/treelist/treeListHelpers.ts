import { batch } from "solid-js";
import { DragDropData } from "../DragNode";
import type { SegmentTreeItem, LightTreeItem, TreeItem, EffectControlData, SegmentTreeGroup, SegmentItem } from "../../types/ItemData";
import { lightGroups } from "../../sections/LightGroupTree";
import { type Effect } from "../../../public/Effect";
import { invoke } from "@tauri-apps/api/core";
import JSON5 from "json5";
import { instanceLeaf } from "../../helpers/effectHelpers";

import effect_svg from "/src/assets/effect.svg";

/**
 * Assign id to tree items recursively and prepare data object.
 *
 * @param item The start/current item to assign
 * @param id the identifier to assign an to use a base id for its children
 */
export const assignId = (item: SegmentTreeItem | LightTreeItem, id: string): void => {
  item.id = id;
  // Create data object
  if (!item.data) {
    item.data = {};
  }

  if ("children" in item)
    item.children.forEach((child, idx) => assignId(child, `${id}_${idx}`));
}

/**
 * Set tree item property recursively.
 *
 * @param item The start/current item to iterate
 * @param property the property to set, defaults to `"selected"`
 * @param value The value to assign, defaults to `false`
 */
export const setRecursiveProperty = (item: SegmentTreeItem | LightTreeItem, property = "selected", value: any = false) => {
  if (property in item)
    //@ts-ignore - We just checked
    item[property] = value;
  if ("children" in item)
    item.children.forEach((child) => setRecursiveProperty(child, property, value));
};

/**
 * Get tree item from array of indexes.
 *
 * @param rootItem The root item to start traversing from.
 * @param indexes the array of indexes.
 * @returns a tree item, if available from the indexes.
 */
export const treeItemFromArray = <T = SegmentTreeItem | LightTreeItem>(rootItem: T, indexes?: number[]): T | undefined => {
    if (!indexes) return undefined;

    // TODO: migrate towards produce: https://docs.solidjs.com/reference/store-utilities/produce
    const item = indexes.slice(1).reduce</*T|undefined*/any>((parent, childIndex) =>
      parent?.children?.[childIndex], rootItem);

    // Assign id dynamically
    item.id = indexes.join("_");
    return item;
};

/**
 * Get array from tree item.
 *
 * @param item The tree item to get the indexes from (needs generated id)
 * @returns The array of indexes identifying the item within the tree.
 */
export function arrayFromTreeItem(
  item: TreeItem,
): number[] {

  if (item.id) {
    return item.id.split("_").map(Number);
  }

  throw new TypeError("Expected id!");
};

/**
 * Get tree item's parent using id index traversal.
 *
 * @param rootItem The root item to to the parent traversal.
 * @param indexes The tree item's index array
 * @returns 
 */
export const getParent = <T = SegmentTreeItem | LightTreeItem>(rootItem: T, indexes?: number[]): T | undefined => {
  if (!indexes?.length) return undefined;
  return treeItemFromArray(rootItem, indexes.slice(0,-1));
};

const selectSet = new Set<SegmentTreeItem | LightTreeItem>();

type CallbackSingle<T = SegmentTreeItem | LightTreeItem> = (selected?: T) => void;
type CallbackMulti<T = SegmentTreeItem | LightTreeItem> = (selected: Array<T>) => void;
type ClickHandler = (indexes: number[], ctrl?: boolean) => void;
export function treeClickHelper<T = SegmentTreeItem | LightTreeItem>(rootItem: T, callback?: CallbackMulti<T>, multiSelect?: true): ClickHandler;
export function treeClickHelper<T = SegmentTreeItem | LightTreeItem>(rootItem: T, callback?: CallbackSingle<T>, multiSelect?: false | undefined): ClickHandler;
export function treeClickHelper<T extends SegmentTreeItem | LightTreeItem = SegmentTreeItem | LightTreeItem>(rootItem: T, callback?: CallbackSingle<T> | CallbackMulti<T>, multiSelect?: boolean): ClickHandler {
  // TODO: treeClickHelper is executed every time the list is updated. Probably due to reactive treeList parameter.
  return (indexes: number[], ctrl?: boolean) => {
    const clickedChild = treeItemFromArray(rootItem, indexes);
    if (!clickedChild) {
      if (!multiSelect) {
        // Deselect all
        setRecursiveProperty(rootItem);
        // @ts-expect-error -- Typescript doesn't understand the overloads
        callback?.(undefined);
      }
      return;
    };

    if (ctrl && multiSelect)
    {
      clickedChild.selected = !clickedChild.selected;
      if (clickedChild.selected)
        selectSet.add(clickedChild);
      else
        selectSet.delete(clickedChild);

    } else {
      batch(() => {
        // Deselect all
        setRecursiveProperty(rootItem);
        clickedChild.selected = true;
        selectSet.clear();
        selectSet.add(clickedChild);
      });
    }
    // @ts-expect-error -- Typescript doesn't understand the overloads
    callback?.(multiSelect ? [...selectSet.values()] : clickedChild);
  }
}

type DragCallback<T = SegmentTreeItem | LightTreeItem> = (item: T, data: DragDropData, side: string) => void;
export const treeDragHelper = <T extends SegmentTreeItem | LightTreeItem = SegmentTreeItem | LightTreeItem>(rootItem: T, callback?: DragCallback<T>) => {
  return (event: DragEvent | CustomEvent<DragDropData>): boolean => {
    setRecursiveProperty(rootItem, "outlined", false);
    const target = event.target as HTMLElement;
    if (!target) return false;

    // Drag edge scroll magic 
    const list = (event.currentTarget as HTMLUListElement);
    const detail = event.detail as DragDropData;
    const margin = list.offsetHeight / 6;
    if (detail.y && detail.y < list.offsetTop + margin) {
      list.scrollBy({top: -margin / 10});
    }
    if (detail.y && detail.y > list.offsetTop + list.offsetHeight - margin) {
      list.scrollBy({top: margin / 10});
    }

    const child = treeItemFromArray(rootItem, target.id.split("_").map(s => parseInt(s)));
    if (!child) return false;

    // Over action
    if (event.type === "dragover")
      child.outlined = true;

    callback?.(child, detail, "center");
    return false;
  };
};

// Dedicated to LightGroupTree: Effect management

/**
 * Determine ancestor effect
 *
 * @param item The item to start traversing.
 * @returns The effect, channelValues and channelMute from the ancestor that mandates the current item's effect
 */
export const getAncestorEffect = (item: SegmentTreeItem): { effect: Effect | undefined, channelValues: number[], channelMute: boolean[] } => {
  const indexes = arrayFromTreeItem(item)
  let effect: Effect | undefined;

  while (!effect && indexes.length) {
    const item = treeItemFromArray(lightGroups, indexes);
    const data = item?.data as EffectControlData | undefined;
    effect = data?.effect;

    if (effect) {
      return {
        effect,
        channelValues: data?.channelValues?.slice() ?? [],
        channelMute: data?.channelMute?.slice() ?? [],
      }
    }

    indexes.pop();
  }

  return { effect, channelValues: [], channelMute: [] };
};

/**
 * Get descending instances
 * @param effect The effect we are looking for
 * @param item The item we want to traverse
 * @returns a list of Segment tree items that have an effect instances attached that match the desired effect
 */
export const getMatchingDescendants = (effect: Effect, item: SegmentTreeItem): SegmentTreeItem[] => {
  switch (item.type) {
    case "group":
      // Skip if our active effect does not match
      if (item.data.effect && item.data.effect.name !== effect.name) break;

      // We're not leaf level; add our descendants as well
      return Array.prototype.concat.call(item, item.children.map(getMatchingDescendants.bind(this, effect))).flat();

    case "segment":
      // Do we have an instance that matches our effect?
      if (item.data.effectInstance && item.data.effectInstance instanceof effect)
        return [item];
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

export const over = (_item: SegmentTreeItem, _data: DragDropData<Effect>, _side: string) => {
};

export const drop = (item: SegmentTreeItem, data: DragDropData<Effect>) => {
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

export const readGroups = async (filename: string): Promise<SegmentTreeGroup | undefined> => {
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
