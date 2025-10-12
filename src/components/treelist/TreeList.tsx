import { Component, createEffect, For } from "solid-js";
import TreeItem, { type TreeItemProps } from "./TreeItem";

import styles from "./Treelist.module.css";
import { createStore } from "solid-js/store";
export type TreeListProps<T = any> = {
  children: TreeItemProps<T>[];
  onClick?: (indexes?: number[], ctrl?: boolean) => void; // TODO: index(es)
  class?: string;
  /** Whether to allow horizontal scrolling */
  horizontalScroll?: boolean;
  /** Drag-drop accept types */
  accept?: string[]
  /** Whether we're a partial tree (i.e. child) */
  partial?: boolean;
  onDragOver?: (event: DragEvent) => boolean;
  onDrop?: (event: DragEvent) => boolean;
  idPrefix?: string;
}

export const TreeList: Component<TreeListProps> = (props) => {

  const [classes, setClasses] = createStore<{
    [k: string]: boolean | undefined;
  }>({[styles.list]: true});

  createEffect(() => {
    setClasses([styles.horizontalScroll], props.horizontalScroll);
    setClasses([styles.base], !props.partial);
  });

  const onClick = (event) => {
    if (!props.onClick) return;

    console.log("TREE CLIKC", event);

    // props.onClick?.(isIndexedAccessTypeNode, ctrl);
  }

  return <ul
    classList={classes}
    data-accept={props.accept}
    onDragOver={props.onDragOver}
    onDrop={props.onDrop}
    onClick={onClick}
  >
    <For each={props.children}>{(child, i) => 
      <TreeItem id={props.idPrefix ? `${props.idPrefix}_${i()}` : `${i()}`} {...child} onClick={(list, ctrl) => props.onClick?.(list ? [i(), ...list] : [i()], ctrl)}/>
    }</For>
  </ul>;
};

export default TreeList;
