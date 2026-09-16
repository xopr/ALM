import { batch } from "solid-js";
import { DragDropData } from "../DragNode";
import type { SegmentTreeItem, LightTreeItem, TreeItem } from "../../types/ItemData";

export const assignId = (item: SegmentTreeItem | LightTreeItem, id: string): void => {
  item.id = id;
  // Create data object
  if (!item.data) {
    item.data = {};
  }

  if ("children" in item)
    item.children.forEach((child, idx) => assignId(child, `${id}_${idx}`));
}

export const setRecursiveProperty = (item: SegmentTreeItem | LightTreeItem, property = "selected", value: any = false) => {
  if (property in item)
    //@ts-ignore - We just checked
    item[property] = value;
  if ("children" in item)
    item.children.forEach((child) => setRecursiveProperty(child, property, value));
};

export const treeItemFromArray = <T = SegmentTreeItem | LightTreeItem>(rootItem: T, indexes?: number[]): T | undefined => {
    if (!indexes) return undefined;

    // TODO: migrate towards produce: https://docs.solidjs.com/reference/store-utilities/produce
    const item = indexes.slice(1).reduce</*T|undefined*/any>((parent, childIndex) =>
      parent?.children?.[childIndex], rootItem);

    // Assign id dynamically
    item.id = indexes.join("_");
    return item;
};

export function arrayFromTreeItem(
  item: TreeItem,
): number[] {

  if (item.id) {
    return item.id.split("_").map(Number);
  }

  throw new TypeError("Expected id!");
};

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

    const child = treeItemFromArray(rootItem, target.id.split("_").map(s => parseInt(s)));
    if (!child) return false;

    // Over action
    if (event.type === "dragover")
      child.outlined = true;

    callback?.(child, event.detail as DragDropData, "center");
    return false;
  };
};

