import { Component, createEffect, For } from "solid-js";
import TreeItem, { type TreeItemProps } from "./TreeItem";

// import styles from "./Treelist.module.css";
// import { createStore } from "solid-js/store";
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

  const onClick = (event: MouseEvent & {currentTarget: HTMLUListElement; target: Element;}) => {
    const { target } = event;
    if (!props.onClick || !target) return;

    const indexes = target.id.split("_").map(s => parseInt(s))
    props.onClick?.(indexes, event.ctrlKey);
  }

  return <ul
    class={props.class}
    data-accept={props.accept}
    onDragOver={props.onDragOver}
    onDrop={props.onDrop}
    onClick={onClick}
    onContextMenu={(e) => {
      const { target } = e;
      onClick({ target, ctrlKey: true } as any);
      e.preventDefault()
      return false;
    }}
  >
    <For each={props.children}>{(child, i) => 
      <TreeItem
        id={props.idPrefix ? `${props.idPrefix}_${i()}` : `${i()}`}
        {...child}
      />
    }</For>
  </ul>;
};

export default TreeList;
