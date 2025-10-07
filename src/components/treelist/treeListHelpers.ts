import { TreeItemProps } from "./TreeItem";
import { TreeListProps } from "./TreeList";

export const clearTreeSelection = (treeitem: TreeItemProps | TreeListProps) => {
  if ("selected" in treeitem)
    treeitem.selected = false;
  treeitem.children?.forEach(clearTreeSelection);
}

export const treeItemFromArray = (treeList: TreeListProps, indexes?: number[]): TreeItemProps | undefined => {
    if (!indexes) return undefined;

    // TODO: migrate towards produce: https://docs.solidjs.com/reference/store-utilities/produce
    return indexes.reduce<TreeItemProps|undefined>((parent, childIndex) =>
      parent?.children?.[childIndex], treeList as TreeItemProps);

}