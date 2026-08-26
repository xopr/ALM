import { batch } from "solid-js";
import { TreeItemProps } from "./TreeItem";
import { DragDropData } from "../DragNode";

export const assignId = (item: TreeItemProps, id: string): void => {
  item.id = id;
  item.children?.forEach((child, idx) => assignId(child, `${id}_${idx}`));
}

export const setRecursiveProperty = (treeitem: TreeItemProps, property = "selected", value: any = false) => {
  if (property in treeitem)
    //@ts-ignore - We just checked
    treeitem[property] = value;
  treeitem.children?.forEach((child) => setRecursiveProperty(child, property, value));
};

export const treeItemFromArray = <T = TreeItemProps>(rootItem: T, indexes?: number[]): T | undefined => {
    if (!indexes) return undefined;

    // TODO: migrate towards produce: https://docs.solidjs.com/reference/store-utilities/produce
    const item = indexes.slice(1).reduce</*T|undefined*/any>((parent, childIndex) =>
      parent?.children?.[childIndex], rootItem);

    // Assign id dynamically
    item.id = indexes.join("_");
    return item;
};

export const arrayFromTreeItem = (parent: TreeItemProps, item: TreeItemProps, baseIndexes?: number[]): number[] => {
  // Include the root node
  const base = baseIndexes ?? [0];

  // We are the chosen one!
  if (parent === item) return base;

  // Not found, no children: dud.
  if (!parent.children?.length) return [];

  for (let idx = 0; idx < parent.children.length; ++idx)
  {
    // Chosen one is our descendant!
    const ret = arrayFromTreeItem(parent.children[idx], item, [...base, idx])
    if (ret.length) return ret;
  }

  // Not in our subtree
  return [];
};

export const getParent = (rootItem: TreeItemProps, indexes?: number[]): TreeItemProps | undefined => {
  if (!indexes?.length) return undefined;
  return treeItemFromArray(rootItem, indexes.slice(0,-1));
};

const selectSet = new Set<TreeItemProps>();

type CallbackSingle = (selected?: TreeItemProps) => void;
type CallbackMulti = (selected: TreeItemProps[]) => void;
type ClickHandler = (indexes: number[], ctrl?: boolean) => void;
export function treeClickHelper(rootItem: TreeItemProps, callback?: CallbackMulti, multiSelect?: true): ClickHandler;
export function treeClickHelper(rootItem: TreeItemProps, callback?: CallbackSingle, multiSelect?: false | undefined): ClickHandler;
export function treeClickHelper(rootItem: TreeItemProps, callback?: CallbackSingle | CallbackMulti, multiSelect?: boolean): ClickHandler {
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

type DragCallback = (item: TreeItemProps, data: DragDropData, side: string) => void;
export const treeDragHelper = (rootItem: TreeItemProps, callback?: DragCallback) => {
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

