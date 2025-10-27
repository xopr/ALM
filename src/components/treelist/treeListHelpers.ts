import { batch } from "solid-js";
import { TreeItemProps } from "./TreeItem";
import { TreeListProps } from "./TreeList";
import { DragDropData } from "../DragNode";

export const setRecursiveProperty = (treeitem: TreeItemProps | TreeListProps, property = "selected", value: any = false) => {
  if (property in treeitem)
    //@ts-ignore - We just checked
    treeitem[property] = value;
  treeitem.children?.forEach((child) => setRecursiveProperty(child, property, value));
};

export const treeItemFromArray = <T = TreeItemProps>(treeList: TreeListProps, indexes?: number[]): T | undefined => {
    if (!indexes) return undefined;

    // TODO: migrate towards produce: https://docs.solidjs.com/reference/store-utilities/produce
    return indexes.reduce<TreeItemProps|undefined>((parent, childIndex) =>
      parent?.children?.[childIndex], treeList as TreeItemProps);
};

export const arrayFromTreeItem = (parent: TreeListProps | TreeItemProps, item: TreeItemProps, baseIndexes?: number[]): number[] => {
  const base = baseIndexes ?? [];

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

export const getParent = (treeList: TreeListProps, indexes?: number[]): TreeItemProps | undefined => {
  if (!indexes?.length) return undefined;
  return treeItemFromArray(treeList, indexes.slice(0,-1));
};

const selectSet = new Set<TreeItemProps>();

type CallbackSingle = (selected?: TreeItemProps) => void;
type CallbackMulti = (selected: TreeItemProps[]) => void;
type ClickHandler = (indexes?: number[], ctrl?: boolean) => void;
export function treeClickHelper(treeList: TreeListProps, callback?: CallbackMulti, multiSelect?: true): ClickHandler;
export function treeClickHelper(treeList: TreeListProps, callback?: CallbackSingle, multiSelect?: false | undefined): ClickHandler;
export function treeClickHelper(treeList: TreeListProps, callback?: CallbackSingle | CallbackMulti, multiSelect?: boolean): ClickHandler {
  // TODO: treeClickHelper is executed every time the list is updated. Probably due to reactive treeList parameter.
  return (indexes?: number[], ctrl?: boolean) => {
    const clickedChild = treeItemFromArray(treeList, indexes);
    if (!clickedChild) {
      if (!multiSelect) {
        // Deselect all
        setRecursiveProperty(treeList);
        // @ts-expect-error -- Typescript doesn't understand the overloads
        callback?.(undefined);
      }
      return;
    };

    // Since the original item may not have an id, extract it from the indexes, if needed.
    // Note that we wan't use an array since it would be unique every time.
    const id = clickedChild.id ?? indexes!.join("_");
  
    if (ctrl && multiSelect)
    {
      clickedChild.selected = !clickedChild.selected;
      if (clickedChild.selected)
        // selectSet.add(id);
        selectSet.add(clickedChild);
      else
        // selectSet.delete(id);
        selectSet.delete(clickedChild);

    } else {
      batch(() => {
        // Deselect all
        setRecursiveProperty(treeList);
        clickedChild.selected = true;
        selectSet.clear();
        // selectSet.add(id);
        selectSet.add(clickedChild);
      });
    }
    // @ts-expect-error -- Typescript doesn't understand the overloads
    callback?.(multiSelect ? [...selectSet.values()] : clickedChild);
  }
}

type DragCallback = (item: TreeItemProps, data: DragDropData, side: string) => void;
export const treeDragHelper = (treeList: TreeListProps, callback?: DragCallback) => {
  return (event: DragEvent | CustomEvent<DragDropData>): boolean => {
    setRecursiveProperty(treeList, "outlined", false);
    const target = event.target as HTMLElement;
    if (!target) return false;
  
    const child = treeItemFromArray(treeList, target.id.split("_").map(s => parseInt(s)));
    if (!child) return false;
  
    // Over action
    if (event.type === "dragover")
      child.outlined = true;

    callback?.(child, event.detail as DragDropData, "center");
    return false;
  };
};

