import { Component, createEffect, createMemo, For } from "solid-js";
import TreeItem, { type TreeItemProps } from "./TreeItem";

import styles from "./Treelist.module.css";
import { createStore } from "solid-js/store";
export type TreeListProps = {
  children: TreeItemProps[];
  onClick?: (indexes?: number[], ctrl?: boolean) => void; // TODO: index(es)
  class?: string;
  /** Whether to allow horizontal scrolling */
  horizontalScroll?: boolean;
  /** Whether we're a partial tree (i.e. child) */
  partial?: boolean;
}

export const TreeList: Component<TreeListProps> = (props) => {

  const [classes, setClasses] = createStore<{
    [k: string]: boolean | undefined;
  }>({[styles.list]: true});

  createEffect(() => {
    setClasses([styles.horizontalScroll], props.horizontalScroll);
    setClasses([styles.base], !props.partial);
  });

  return <ul classList={classes}>
    <For each={props.children}>{(child, i) => 
      <TreeItem {...child} onClick={(list, ctrl) => props.onClick?.(list ? [i(), ...list] : [i()], ctrl)}/>
    }</For>
  </ul>;
};

export default TreeList;
