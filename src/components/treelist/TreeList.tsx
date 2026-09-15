import { Component, splitProps } from "solid-js";
import TreeItem from "./TreeItem";
import type { SegmentTreeItem, LightTreeItem } from "../../types/ItemData";

export type TreeListProps = {
  /** Root node of the tree */
  item: SegmentTreeItem | LightTreeItem;
  /** Whether to hide the root node to show a flat list */
  hideRoot?: boolean;
  /** Tree item click handler */
  onClick?: (indexes: number[], ctrl?: boolean) => void;
  class?: string;
  /** Whether to allow horizontal scrolling */
  horizontalScroll?: boolean;
  /** Drag-drop accept types */
  accept?: string[]
  /** Whether we're a partial tree (i.e. child) */
  partial?: boolean;
  /** Drag handler */
  onDragOver?: (event: DragEvent) => boolean;
  /** Drag handler */
  onDrop?: (event: DragEvent) => boolean;
}

export const TreeList: Component<TreeListProps> = (props) => {
  const [name, other] = splitProps(props.item, ["name"]);
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
    <TreeItem
      {...other}
      name={props.hideRoot ? undefined : name.name}
      id="0"
    />
  </ul>;
};

export default TreeList;
